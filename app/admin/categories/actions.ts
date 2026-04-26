"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/current-user";
import {
  createCategory,
  createSubcategory,
  getCategoryById,
  getNextCategorySortOrder,
  getNextSubcategorySortOrder,
  getSubcategoryById,
  isCategorySlugTaken,
  isSubcategorySlugTaken,
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
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug: латиница, цифры и дефисы.");

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
    redirect(`/admin/categories/new?error=${encodeURIComponent("Такой slug уже занят.")}`);
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
  revalidatePath("/catalog");
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
    redirect(`/admin/categories/${id}/edit?error=${encodeURIComponent("Такой slug уже занят.")}`);
  }

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
  revalidatePath("/catalog");
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
      `/admin/categories/${categoryId}/subcategories/new?error=${encodeURIComponent("Такой slug уже занят.")}`,
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
  revalidatePath("/catalog");
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
      `/admin/categories/${categoryId}/subcategories/${id}/edit?error=${encodeURIComponent("Такой slug уже занят.")}`,
    );
  }

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
  revalidatePath("/catalog");
  redirect(`/admin/categories/${categoryId}/subcategories/${id}/edit?saved=1`);
}
