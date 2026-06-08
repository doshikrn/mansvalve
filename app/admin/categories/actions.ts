"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { safeReturnTo } from "@/lib/admin/safe-return-to";
import { requireAdmin } from "@/lib/auth/current-user";
import { settleRevalidation } from "@/lib/revalidation";
import { catalogCategoryPath, catalogSubcategoryPath } from "@/lib/catalog-routes";
import {
  CategoryDeleteBlockedError,
  createCategory,
  createSubcategory,
  deleteCategory,
  deleteSubcategory,
  getCategoryById,
  getNextCategorySortOrder,
  getNextSubcategorySortOrder,
  getSubcategoryById,
  SubcategoryDeleteBlockedError,
  isCategorySlugTaken,
  isSubcategorySlugTaken,
  listCategoriesWithSubcategories,
  listSubcategoriesFor,
  splitLineList,
  splitParagraphBlocks,
  updateCategory,
  updateSubcategory,
} from "@/lib/services/categories";
import { slugify } from "@/lib/services/slug";

const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(160)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Ссылка: только латиница, цифры и дефисы.");

function nullableTrimmed(max: number) {
  return z
    .string()
    .max(max)
    .optional()
    .transform((v) => {
      const t = v?.trim();
      return t ? t : null;
    });
}

function checkboxActive(v: FormDataEntryValue | null): boolean {
  return v === "on" || v === "true" || v === "1";
}

function buildSeoContentFromForm(formData: FormData) {
  const topSeo = splitParagraphBlocks(String(formData.get("topSeo") ?? ""));
  const trust = splitLineList(String(formData.get("trustLines") ?? ""));
  const bottomSeo = splitParagraphBlocks(String(formData.get("bottomSeo") ?? ""));
  const ctaHeading = String(formData.get("ctaHeading") ?? "").trim();
  const ctaDescription = String(formData.get("ctaDescription") ?? "").trim();

  const hasAny =
    topSeo.length > 0 ||
    trust.length > 0 ||
    bottomSeo.length > 0 ||
    ctaHeading.length > 0 ||
    ctaDescription.length > 0;

  if (!hasAny) return null;

  return {
    topSeo,
    trust,
    bottomSeo,
    ctaHeading: ctaHeading || " ",
    ctaDescription: ctaDescription || " ",
  };
}

const categoryBaseSchema = z.object({
  name: z.string().trim().min(1).max(200),
  slug: slugSchema,
  description: nullableTrimmed(50_000),
  seoMetaDescription: nullableTrimmed(2000),
  heroImageUrl: z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.string().url().max(1000).optional(),
  ).transform((v) => v ?? null),
  sortOrder: z.coerce.number().int().min(0).max(1_000_000),
  isActive: z.boolean(),
});

type PublicCategoryRouteInfo = {
  slug: string | null;
};

type PublicSubcategoryRouteInfo = {
  slug: string | null;
};

function revalidateCatalogPublicPaths(
  categories: Array<PublicCategoryRouteInfo | null | undefined> = [],
  subcategories: Array<PublicSubcategoryRouteInfo | null | undefined> = [],
) {
  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/catalog");
  revalidatePath("/catalog", "layout");
  revalidatePath("/catalog/[slug]", "page");
  revalidatePath("/catalog/[slug]/[subcategorySlug]", "page");
  revalidatePath("/catalog/category/[categorySlug]", "page");
  revalidatePath("/catalog/subcategory/[subcategorySlug]", "page");
  revalidatePath("/sitemap.xml");

  const categorySlugs = categories.map((c) => c?.slug).filter(Boolean) as string[];

  for (const slug of categorySlugs) {
    revalidatePath(catalogCategoryPath(slug));
    revalidatePath(`/catalog/category/${slug}`);
  }

  for (let i = 0; i < subcategories.length; i++) {
    const sub = subcategories[i];
    if (!sub?.slug) continue;
    const owningCategorySlug = categorySlugs[i] ?? categorySlugs[0];
    if (owningCategorySlug) {
      revalidatePath(catalogSubcategoryPath(owningCategorySlug, sub.slug));
    }
    revalidatePath(`/catalog/subcategory/${sub.slug}`);
  }
}

function compareCategoriesBySort<T extends { sortOrder: number; name: string }>(a: T, b: T) {
  if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
  return a.name.localeCompare(b.name, "ru");
}

function compareSubcategoriesBySort<T extends { sortOrder: number; name: string }>(a: T, b: T) {
  if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
  return a.name.localeCompare(b.name, "ru");
}

function listViewFromForm(formData: FormData): "categories" | "subcategories" {
  return String(formData.get("listView") ?? "") === "subcategories" ? "subcategories" : "categories";
}

function withAdminStatusParam(href: string, key: "msg" | "error", value: string): string {
  const [path, query = ""] = href.split("?");
  const params = new URLSearchParams(query);
  params.set(key, value);
  return `${path}?${params.toString()}`;
}

const quickSortOrderSchema = z.object({
  id: z.coerce.number().int().positive(),
  sortOrder: z.coerce.number().int().min(0).max(1_000_000),
});

const moveCategorySchema = z.object({
  id: z.coerce.number().int().positive(),
  direction: z.enum(["up", "down"]),
});

const moveSubcategorySchema = z.object({
  id: z.coerce.number().int().positive(),
  categoryId: z.coerce.number().int().positive(),
  direction: z.enum(["up", "down"]),
});

/** Swap sort_order with adjacent row in the ordered list (no drag-and-drop). */
export async function moveCategoryInListAction(formData: FormData) {
  await requireAdmin("/admin/categories");
  const listView = listViewFromForm(formData);
  const parsed = moveCategorySchema.safeParse({
    id: formData.get("id"),
    direction: formData.get("direction"),
  });
  if (!parsed.success) {
    redirect(`/admin/categories?view=${listView}&error=${encodeURIComponent(parsed.error.message)}`);
  }

  const rows = await listCategoriesWithSubcategories();
  const sorted = [...rows].sort(compareCategoriesBySort);
  const idx = sorted.findIndex((c) => c.id === parsed.data.id);
  if (idx < 0) {
    redirect(`/admin/categories?view=${listView}&error=${encodeURIComponent("Категория не найдена.")}`);
  }
  const swapIdx = parsed.data.direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= sorted.length) {
    redirect(`/admin/categories?view=${listView}`);
  }

  const a = sorted[idx];
  const b = sorted[swapIdx];
  await updateCategory(a.id, { sortOrder: b.sortOrder });
  await updateCategory(b.id, { sortOrder: a.sortOrder });

  revalidatePath("/admin/categories");
  revalidateCatalogPublicPaths([a, b]);
  await settleRevalidation();
  redirect(
    `/admin/categories?view=${listView}&msg=category_moved&focus=cat-${parsed.data.id}`,
  );
}

export async function quickSetCategorySortOrderAction(formData: FormData) {
  await requireAdmin("/admin/categories");
  const listView = listViewFromForm(formData);
  const parsed = quickSortOrderSchema.safeParse({
    id: formData.get("id"),
    sortOrder: formData.get("sortOrder"),
  });
  if (!parsed.success) {
    redirect(`/admin/categories?view=${listView}&error=${encodeURIComponent(parsed.error.message)}`);
  }

  const existing = await getCategoryById(parsed.data.id);
  if (!existing) {
    redirect(`/admin/categories?view=${listView}&error=${encodeURIComponent("Категория не найдена.")}`);
  }

  await updateCategory(parsed.data.id, { sortOrder: parsed.data.sortOrder });

  revalidatePath("/admin/categories");
  revalidateCatalogPublicPaths([existing]);
  await settleRevalidation();
  redirect(
    `/admin/categories?view=${listView}&msg=category_sort_saved&focus=cat-${parsed.data.id}`,
  );
}

export async function moveSubcategoryInListAction(formData: FormData) {
  await requireAdmin("/admin/categories");
  const listView = listViewFromForm(formData);
  const parsed = moveSubcategorySchema.safeParse({
    id: formData.get("id"),
    categoryId: formData.get("categoryId"),
    direction: formData.get("direction"),
  });
  if (!parsed.success) {
    redirect(`/admin/categories?view=${listView}&error=${encodeURIComponent(parsed.error.message)}`);
  }

  const parent = await getCategoryById(parsed.data.categoryId);
  if (!parent) {
    redirect(`/admin/categories?view=${listView}&error=${encodeURIComponent("Категория не найдена.")}`);
  }

  const subs = await listSubcategoriesFor(parsed.data.categoryId);
  const sorted = [...subs].sort(compareSubcategoriesBySort);
  const idx = sorted.findIndex((s) => s.id === parsed.data.id);
  if (idx < 0) {
    redirect(`/admin/categories?view=${listView}&error=${encodeURIComponent("Подкатегория не найдена.")}`);
  }
  const swapIdx = parsed.data.direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= sorted.length) {
    redirect(`/admin/categories?view=${listView}`);
  }

  const a = sorted[idx];
  const b = sorted[swapIdx];
  await updateSubcategory(a.id, { sortOrder: b.sortOrder });
  await updateSubcategory(b.id, { sortOrder: a.sortOrder });

  revalidatePath("/admin/categories");
  revalidateCatalogPublicPaths([parent], [a, b]);
  await settleRevalidation();
  redirect(
    `/admin/categories?view=${listView}&msg=subcategory_moved&focus=sub-${parsed.data.id}`,
  );
}

export async function quickSetSubcategorySortOrderAction(formData: FormData) {
  await requireAdmin("/admin/categories");
  const listView = listViewFromForm(formData);
  const parsed = quickSortOrderSchema
    .extend({ categoryId: z.coerce.number().int().positive() })
    .safeParse({
      id: formData.get("id"),
      categoryId: formData.get("categoryId"),
      sortOrder: formData.get("sortOrder"),
    });
  if (!parsed.success) {
    redirect(`/admin/categories?view=${listView}&error=${encodeURIComponent(parsed.error.message)}`);
  }

  const [parent, existing] = await Promise.all([
    getCategoryById(parsed.data.categoryId),
    getSubcategoryById(parsed.data.id),
  ]);
  if (!parent || !existing || existing.categoryId !== parsed.data.categoryId) {
    redirect(`/admin/categories?view=${listView}&error=${encodeURIComponent("Подкатегория не найдена.")}`);
  }

  await updateSubcategory(parsed.data.id, { sortOrder: parsed.data.sortOrder });

  revalidatePath("/admin/categories");
  revalidateCatalogPublicPaths([parent], [existing]);
  await settleRevalidation();
  redirect(
    `/admin/categories?view=${listView}&msg=subcategory_sort_saved&focus=sub-${parsed.data.id}`,
  );
}

export async function deleteCategoryAction(formData: FormData) {
  await requireAdmin("/admin/categories");
  const id = Number(formData.get("id"));
  const returnTo = safeReturnTo(
    String(formData.get("returnTo") ?? ""),
    "/admin/categories?view=categories",
  );

  if (!Number.isFinite(id) || id <= 0) {
    redirect(withAdminStatusParam(returnTo, "error", "Категория не найдена."));
  }

  const existing = await getCategoryById(id);
  if (!existing) {
    redirect(withAdminStatusParam(returnTo, "error", "Категория не найдена."));
  }

  try {
    await deleteCategory(id);
  } catch (error) {
    if (error instanceof CategoryDeleteBlockedError) {
      redirect(
        withAdminStatusParam(
          returnTo,
          "error",
          "Нельзя удалить категорию, пока в ней есть товары или подкатегории. Сначала перенесите или удалите связанные элементы.",
        ),
      );
    }
    console.error("[categories] delete category failed", error);
    redirect(withAdminStatusParam(returnTo, "error", "Не удалось удалить категорию. Попробуйте ещё раз."));
  }

  revalidatePath("/admin/categories");
  revalidateCatalogPublicPaths([existing]);
  await settleRevalidation();
  redirect(withAdminStatusParam(returnTo, "msg", "Категория удалена."));
}

export async function deleteSubcategoryAction(formData: FormData) {
  await requireAdmin("/admin/categories");
  const id = Number(formData.get("id"));
  const categoryId = Number(formData.get("categoryId"));
  const returnTo = safeReturnTo(
    String(formData.get("returnTo") ?? ""),
    Number.isFinite(categoryId) && categoryId > 0
      ? `/admin/categories/${categoryId}/edit`
      : "/admin/categories?view=subcategories",
  );

  if (!Number.isFinite(id) || id <= 0) {
    redirect(withAdminStatusParam(returnTo, "error", "Подкатегория не найдена."));
  }

  const existing = await getSubcategoryById(id);
  if (!existing) {
    redirect(withAdminStatusParam(returnTo, "error", "Подкатегория не найдена."));
  }

  const parent = await getCategoryById(existing.categoryId);

  try {
    await deleteSubcategory(id);
  } catch (error) {
    if (error instanceof SubcategoryDeleteBlockedError) {
      redirect(
        withAdminStatusParam(
          returnTo,
          "error",
          "Нельзя удалить подкатегорию, пока в ней есть товары. Сначала перенесите товары или удалите их.",
        ),
      );
    }
    console.error("[categories] delete subcategory failed", error);
    redirect(withAdminStatusParam(returnTo, "error", "Не удалось удалить подкатегорию. Попробуйте ещё раз."));
  }

  revalidatePath("/admin/categories");
  revalidatePath(`/admin/categories/${existing.categoryId}/edit`);
  revalidateCatalogPublicPaths([parent], [existing]);
  await settleRevalidation();
  redirect(withAdminStatusParam(returnTo, "msg", "Подкатегория удалена."));
}

export async function createCategoryAction(formData: FormData) {
  await requireAdmin("/admin/categories");

  const slugInput = String(formData.get("slug") ?? "").trim();
  const slug = slugInput || slugify(String(formData.get("name") ?? ""));

  const sortOrderRaw = formData.get("sortOrder");
  const sortOrderDefault = await getNextCategorySortOrder();
  const sortOrderNum =
    sortOrderRaw != null &&
    String(sortOrderRaw).trim() !== "" &&
    !Number.isNaN(Number(sortOrderRaw))
      ? Number(sortOrderRaw)
      : sortOrderDefault;

  const parsed = categoryBaseSchema.safeParse({
    name: formData.get("name"),
    slug,
    description: formData.get("description"),
    seoMetaDescription: formData.get("seoMetaDescription"),
    heroImageUrl: formData.get("heroImageUrl"),
    sortOrder: sortOrderNum,
    isActive: checkboxActive(formData.get("isActive")),
  });

  if (!parsed.success) {
    redirect(`/admin/categories/new?error=${encodeURIComponent(parsed.error.message)}`);
  }

  if (await isCategorySlugTaken(parsed.data.slug)) {
    redirect(`/admin/categories/new?error=${encodeURIComponent("Такая ссылка уже занята.")}`);
  }

  const id = await createCategory({
    name: parsed.data.name,
    slug: parsed.data.slug,
    description: parsed.data.description,
    seoMetaDescription: parsed.data.seoMetaDescription,
    seoContent: buildSeoContentFromForm(formData),
    heroImageUrl: parsed.data.heroImageUrl,
    sortOrder: parsed.data.sortOrder,
    isActive: parsed.data.isActive,
    externalId: null,
  });

  revalidatePath("/admin/categories");
  revalidateCatalogPublicPaths([{ slug: parsed.data.slug }]);
  await settleRevalidation();
  redirect(`/admin/categories/${id}/edit`);
}

export async function updateCategoryAction(formData: FormData) {
  await requireAdmin("/admin/categories");

  const id = Number(formData.get("id"));
  if (!Number.isFinite(id) || id <= 0) {
    redirect("/admin/categories?error=invalid_id");
  }

  const slugInput = String(formData.get("slug") ?? "").trim();
  const slug = slugInput || slugify(String(formData.get("name") ?? ""));

  const parsed = categoryBaseSchema.safeParse({
    name: formData.get("name"),
    slug,
    description: formData.get("description"),
    seoMetaDescription: formData.get("seoMetaDescription"),
    heroImageUrl: formData.get("heroImageUrl"),
    sortOrder: formData.get("sortOrder"),
    isActive: checkboxActive(formData.get("isActive")),
  });

  if (!parsed.success) {
    redirect(`/admin/categories/${id}/edit?error=${encodeURIComponent(parsed.error.message)}`);
  }

  if (await isCategorySlugTaken(parsed.data.slug, id)) {
    redirect(`/admin/categories/${id}/edit?error=${encodeURIComponent("Такая ссылка уже занята.")}`);
  }

  const existing = await getCategoryById(id);

  await updateCategory(id, {
    name: parsed.data.name,
    slug: parsed.data.slug,
    description: parsed.data.description,
    seoMetaDescription: parsed.data.seoMetaDescription,
    seoContent: buildSeoContentFromForm(formData),
    heroImageUrl: parsed.data.heroImageUrl,
    sortOrder: parsed.data.sortOrder,
    isActive: parsed.data.isActive,
  });

  revalidatePath("/admin/categories");
  revalidatePath(`/admin/categories/${id}/edit`);
  revalidateCatalogPublicPaths([existing, { slug: parsed.data.slug }]);
  await settleRevalidation();
  redirect(`/admin/categories/${id}/edit?saved=1`);
}

const subcategorySchema = z.object({
  categoryId: z.coerce.number().int().positive(),
  name: z.string().trim().min(1).max(200),
  slug: slugSchema,
  description: nullableTrimmed(50_000),
  seoMetaDescription: nullableTrimmed(2000),
  sortOrder: z.coerce.number().int().min(0).max(1_000_000),
  isActive: z.boolean(),
});

export async function createSubcategoryAction(formData: FormData) {
  await requireAdmin("/admin/categories");

  const categoryId = Number(formData.get("categoryId"));
  const parent = await getCategoryById(categoryId);
  if (!parent) redirect("/admin/categories?error=category_not_found");

  const slugInput = String(formData.get("slug") ?? "").trim();
  const slug = slugInput || slugify(String(formData.get("name") ?? ""));

  const sortOrderRaw = formData.get("sortOrder");
  const sortDefault = await getNextSubcategorySortOrder(categoryId);
  const sortOrderNum =
    sortOrderRaw != null &&
    String(sortOrderRaw).trim() !== "" &&
    !Number.isNaN(Number(sortOrderRaw))
      ? Number(sortOrderRaw)
      : sortDefault;

  const parsed = subcategorySchema.safeParse({
    categoryId,
    name: formData.get("name"),
    slug,
    description: formData.get("description"),
    seoMetaDescription: formData.get("seoMetaDescription"),
    sortOrder: sortOrderNum,
    isActive: checkboxActive(formData.get("isActive")),
  });

  if (!parsed.success) {
    redirect(
      `/admin/categories/${categoryId}/subcategories/new?error=${encodeURIComponent(parsed.error.message)}`,
    );
  }

  if (await isSubcategorySlugTaken(parsed.data.slug)) {
    redirect(
      `/admin/categories/${categoryId}/subcategories/new?error=${encodeURIComponent("Такая ссылка уже занята.")}`,
    );
  }

  const subId = await createSubcategory({
    categoryId: parsed.data.categoryId,
    name: parsed.data.name,
    slug: parsed.data.slug,
    description: parsed.data.description,
    seoMetaDescription: parsed.data.seoMetaDescription,
    sortOrder: parsed.data.sortOrder,
    isActive: parsed.data.isActive,
    externalId: null,
  });

  revalidatePath("/admin/categories");
  revalidatePath(`/admin/categories/${categoryId}/edit`);
  revalidateCatalogPublicPaths([parent], [{ slug: parsed.data.slug }]);
  await settleRevalidation();
  redirect(`/admin/categories/${categoryId}/subcategories/${subId}/edit?saved=1`);
}

export async function updateSubcategoryAction(formData: FormData) {
  await requireAdmin("/admin/categories");

  const id = Number(formData.get("id"));
  const categoryId = Number(formData.get("categoryId"));
  if (!Number.isFinite(id) || id <= 0 || !Number.isFinite(categoryId)) {
    redirect("/admin/categories?error=invalid_id");
  }

  const existing = await getSubcategoryById(id);
  if (!existing) redirect("/admin/categories?error=not_found");

  const slugInput = String(formData.get("slug") ?? "").trim();
  const slug = slugInput || slugify(String(formData.get("name") ?? ""));

  const parsed = subcategorySchema.safeParse({
    categoryId,
    name: formData.get("name"),
    slug,
    description: formData.get("description"),
    seoMetaDescription: formData.get("seoMetaDescription"),
    sortOrder: formData.get("sortOrder"),
    isActive: checkboxActive(formData.get("isActive")),
  });

  if (!parsed.success) {
    redirect(
      `/admin/categories/${categoryId}/subcategories/${id}/edit?error=${encodeURIComponent(parsed.error.message)}`,
    );
  }

  if (await isSubcategorySlugTaken(parsed.data.slug, id)) {
    redirect(
      `/admin/categories/${categoryId}/subcategories/${id}/edit?error=${encodeURIComponent("Такая ссылка уже занята.")}`,
    );
  }

  const [oldParent, newParent] = await Promise.all([
    getCategoryById(existing.categoryId),
    getCategoryById(categoryId),
  ]);

  await updateSubcategory(id, {
    categoryId: parsed.data.categoryId,
    name: parsed.data.name,
    slug: parsed.data.slug,
    description: parsed.data.description,
    seoMetaDescription: parsed.data.seoMetaDescription,
    sortOrder: parsed.data.sortOrder,
    isActive: parsed.data.isActive,
  });

  revalidatePath("/admin/categories");
  revalidatePath(`/admin/categories/${categoryId}/edit`);
  revalidateCatalogPublicPaths(
    [oldParent, newParent],
    [existing, { slug: parsed.data.slug }],
  );
  await settleRevalidation();
  redirect(`/admin/categories/${categoryId}/subcategories/${id}/edit?saved=1`);
}
