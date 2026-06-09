"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { safeReturnTo } from "@/lib/admin/safe-return-to";
import { requireAdmin } from "@/lib/auth/current-user";
import { CATALOG_LANDING_PAGES } from "@/lib/catalog-seo";
import { formatProductDisplayName } from "@/lib/catalog/product-naming";
import { buildProductSlugFromTitle } from "@/lib/products-import/slug-builder";
import {
  parseProductDetailBlockLines,
  PRODUCT_DETAIL_BLOCK_FIELDS,
  type ProductDetailBlocks,
} from "@/lib/product-detail-blocks";
import { productDetailToPublicCatalogProduct } from "@/lib/public-catalog/from-product-detail";
import { buildPublicProductView } from "@/lib/public-catalog/product-view";
import { settleRevalidation } from "@/lib/revalidation";
import { catalogCategoryPath, catalogSubcategoryPath } from "@/lib/catalog-routes";
import { listCategoriesWithSubcategories } from "@/lib/services/categories";
import {
  createProduct,
  deleteProduct,
  getProductById,
  updateProduct,
  type ProductDetail,
  type ProductWritePayload,
} from "@/lib/services/products";
import { slugify } from "@/lib/services/slug";
import { getGateValveSeoPageForProduct } from "@/lib/seo-product-pages/gate-valves";

/* -------------------------------------------------------------------------- */
/* Shared parsing                                                             */
/* -------------------------------------------------------------------------- */

const specSchema = z.object({
  key: z.string().trim().min(1).max(120),
  value: z.string().trim().min(1).max(500),
});

const productImageSchema = z.object({
  mediaId: z.string().uuid(),
  alt: z.string().trim().max(300).optional().default(""),
  isPrimary: z.boolean().optional().default(false),
  sortOrder: z.number().int().nonnegative().optional().default(0),
});

const productDocumentsSchema = z.object({
  specificationMediaId: z.string().uuid().nullable().optional(),
  questionnaireMediaId: z.string().uuid().nullable().optional(),
  documentationMediaId: z.string().uuid().nullable().optional(),
});

const productSchema = z.object({
  name: z.string().trim().min(2).max(300),
  publicTitle: z.string().trim().max(300).optional().transform((v) => v || null),
  h1Override: z.string().trim().max(300).optional().transform((v) => v || null),
  slug: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((v) => (v && v.length ? v : undefined)),
  categoryId: z.coerce.number().int().positive(),
  subcategoryId: z
    .union([z.coerce.number().int().positive(), z.literal("")])
    .optional()
    .transform((v) => (typeof v === "number" && v > 0 ? v : null)),
  dn: z
    .union([z.coerce.number().int(), z.literal("")])
    .optional()
    .transform((v) => (v === "" || v === undefined ? null : (v as number))),
  pn: z
    .union([z.coerce.number().int(), z.literal("")])
    .optional()
    .transform((v) => (v === "" || v === undefined ? null : (v as number))),
  thread: z.string().trim().max(60).optional().transform((v) => v || null),
  material: z.string().trim().max(120).optional().transform((v) => v || null),
  connectionType: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((v) => v || null),
  controlType: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((v) => v || null),
  model: z.string().trim().max(120).optional().transform((v) => v || null),
  price: z
    .union([z.coerce.number().nonnegative(), z.literal("")])
    .optional()
    .transform((v) => (v === "" || v === undefined ? null : String(v))),
  priceByRequest: z
    .union([z.literal("on"), z.literal("true"), z.literal("false"), z.literal("")])
    .optional()
    .transform((v) => v === "on" || v === "true"),
  weight: z
    .union([z.coerce.number().nonnegative(), z.literal("")])
    .optional()
    .transform((v) => (v === "" || v === undefined ? null : String(v))),
  shortDescription: z.string().trim().max(2000).optional().transform((v) => v || null),
  longDescription: z.string().trim().max(10000).optional().transform((v) => v || null),
  isActive: z
    .union([z.literal("on"), z.literal("true"), z.literal("false"), z.literal("")])
    .optional()
    .transform((v) => v === "on" || v === "true"),
  isFeatured: z
    .union([z.literal("on"), z.literal("true"), z.literal("false"), z.literal("")])
    .optional()
    .transform((v) => v === "on" || v === "true"),
  sortOrder: z.coerce.number().int().optional().transform((v) => v ?? 0),
});

export type ProductFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: string;
  /** ISO timestamp after successful update (client shows «last saved»). */
  savedAt?: string;
};

type FormInput = FormData | Record<string, unknown>;

function readSpecs(form: FormInput): { key: string; value: string }[] {
  const entries: { key: string; value: string }[] = [];

  if (form instanceof FormData) {
    const keys = form.getAll("specKey[]").map((v) => String(v ?? ""));
    const values = form.getAll("specValue[]").map((v) => String(v ?? ""));
    for (let i = 0; i < keys.length; i++) {
      entries.push({ key: keys[i] ?? "", value: values[i] ?? "" });
    }
  }

  return entries
    .map((e) => ({ key: e.key.trim(), value: e.value.trim() }))
    .filter((e) => e.key && e.value);
}

function parseProductForm(
  formData: FormData,
  options: {
    existingSlug?: string;
    categorySlug?: string;
    categoryName?: string;
    subcategorySlug?: string | null;
    subcategoryName?: string | null;
  } = {},
) {
  const parsed = productSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path.join(".");
      fieldErrors[path] = issue.message;
    }
    return { ok: false as const, fieldErrors };
  }

  const specs = readSpecs(formData)
    .map((s) => specSchema.safeParse(s))
    .filter((r): r is { success: true; data: z.infer<typeof specSchema> } =>
      r.success,
    )
    .map((r) => r.data);

  const images = readImages(formData);
  const documents = readDocuments(formData);
  const detailBlocks = readDetailBlocks(formData);

  const data = parsed.data;
  const generatedDisplayName = formatProductDisplayName({
    name: data.name,
    category: options.categorySlug,
    categoryName: options.categoryName,
    subcategory: options.subcategorySlug,
    subcategoryName: options.subcategoryName,
    model: data.model,
    dn: data.dn,
    pn: data.pn,
    material: data.material,
    connectionType: data.connectionType,
  });
  const slugFromTitle = buildProductSlugFromTitle({
    publicTitle: data.publicTitle,
    generatedDisplayName,
    name: data.name,
  });
  // Slug lifecycle:
  //   1) update — never re-slugify from name; only change when slug field edited.
  //   2) create — slug from submitted field, else public title / generated / name.
  const slug = options.existingSlug
    ? data.slug
      ? slugify(data.slug)
      : options.existingSlug
    : slugify(data.slug ?? "") || slugFromTitle || slugify(data.name);

  if (!slug) {
    return {
      ok: false as const,
      fieldErrors: {
        slug: "Укажите ссылку товара или заполните название для автогенерации.",
      },
    };
  }

  const payload: ProductWritePayload = {
    slug,
    name: data.name,
    publicTitle: data.publicTitle,
    h1Override: data.h1Override,
    categoryId: data.categoryId,
    subcategoryId: data.subcategoryId,
    dn: data.dn ?? null,
    pn: data.pn ?? null,
    thread: data.thread,
    material: data.material,
    connectionType: data.connectionType,
    controlType: data.controlType,
    model: data.model,
    price: data.price ?? null,
    priceByRequest: data.priceByRequest,
    weight: data.weight ?? null,
    shortDescription: data.shortDescription,
    longDescription: data.longDescription,
    detailBlocks,
    isActive: data.isActive,
    isFeatured: data.isFeatured,
    sortOrder: data.sortOrder,
    specs,
    images,
    specificationMediaId: documents.specificationMediaId,
    questionnaireMediaId: documents.questionnaireMediaId,
    documentationMediaId: documents.documentationMediaId,
  };

  return { ok: true as const, payload };
}

function readDetailBlocks(formData: FormData): ProductDetailBlocks | null {
  const hasDetailBlockFields = PRODUCT_DETAIL_BLOCK_FIELDS.some((field) =>
    formData.has(field.name),
  );
  if (!hasDetailBlockFields) return null;

  return {
    standards: parseProductDetailBlockLines(formData.get("detailStandards")),
    benefits: parseProductDetailBlockLines(formData.get("detailBenefits")),
    applications: parseProductDetailBlockLines(formData.get("detailApplications")),
    qualityDocuments: parseProductDetailBlockLines(formData.get("detailQualityDocuments")),
    supplyTerms: parseProductDetailBlockLines(formData.get("detailSupplyTerms")),
  };
}

function readImages(formData: FormData) {
  const raw = formData.get("imagesPayload");
  if (typeof raw !== "string" || !raw.trim()) {
    return [];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) return [];

  const valid = parsed
    .map((value) => productImageSchema.safeParse(value))
    .filter(
      (
        result,
      ): result is { success: true; data: z.infer<typeof productImageSchema> } =>
        result.success,
    )
    .map((result) => result.data);

  if (!valid.length) return [];

  const ordered = [...valid].sort((a, b) => a.sortOrder - b.sortOrder);
  const primaryIndex = ordered.findIndex((x) => x.isPrimary);
  const resolvedPrimary = primaryIndex >= 0 ? primaryIndex : 0;

  return ordered.map((item, index) => ({
    mediaId: item.mediaId,
    alt: item.alt || null,
    isPrimary: index === resolvedPrimary,
    sortOrder: index,
  }));
}

function readDocuments(formData: FormData): z.infer<typeof productDocumentsSchema> {
  const raw = formData.get("documentsPayload");
  if (typeof raw !== "string" || !raw.trim()) {
    return {
      specificationMediaId: null,
      questionnaireMediaId: null,
      documentationMediaId: null,
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = {};
  }

  const validated = productDocumentsSchema.safeParse(parsed);
  if (!validated.success) {
    return {
      specificationMediaId: null,
      questionnaireMediaId: null,
      documentationMediaId: null,
    };
  }
  return {
    specificationMediaId: validated.data.specificationMediaId ?? null,
    questionnaireMediaId: validated.data.questionnaireMediaId ?? null,
    documentationMediaId: validated.data.documentationMediaId ?? null,
  };
}

/* -------------------------------------------------------------------------- */
/* Actions                                                                    */
/* -------------------------------------------------------------------------- */

export async function createProductAction(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireAdmin("/admin/products/new");

  const categoryId = Number(formData.get("categoryId"));
  const categories = await listCategoriesWithSubcategories();
  const category = categories.find((item) => item.id === categoryId);
  const subcategoryIdRaw = String(formData.get("subcategoryId") ?? "").trim();
  const subcategoryId = subcategoryIdRaw ? Number(subcategoryIdRaw) : null;
  const subcategory = category?.subcategories.find((item) => item.id === subcategoryId);

  const parsed = parseProductForm(formData, {
    categorySlug: category?.slug,
    categoryName: category?.name,
    subcategorySlug: subcategory?.slug ?? null,
    subcategoryName: subcategory?.name ?? null,
  });
  if (!parsed.ok) {
    return { fieldErrors: parsed.fieldErrors, error: "Проверьте форму." };
  }

  let id: number;
  try {
    id = await createProduct(parsed.payload);
  } catch (error) {
    console.error("[products] create failed", error);
    return { error: humanizeError(error) };
  }

  revalidatePath("/admin/products");
  revalidateProductPublicPaths(await getProductById(id));
  await settleRevalidation();
  const rawReturnTo = String(formData.get("returnTo") ?? "").trim();
  const returnTo = safeReturnTo(rawReturnTo, "");
  const suffix = returnTo
    ? `?returnTo=${encodeURIComponent(returnTo)}`
    : "";
  redirect(`/admin/products/${id}${suffix}`);
}

export async function updateProductAction(
  id: number,
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireAdmin(`/admin/products/${id}`);

  const before = await getProductById(id);
  const categories = await listCategoriesWithSubcategories();
  const category = categories.find((item) => item.id === before?.categoryId);
  const subcategory = category?.subcategories.find(
    (item) => item.id === before?.subcategoryId,
  );
  const parsed = parseProductForm(formData, {
    existingSlug: before?.slug ?? undefined,
    categorySlug: category?.slug ?? before?.categorySlug,
    categoryName: category?.name ?? before?.categoryName,
    subcategorySlug: subcategory?.slug ?? before?.subcategorySlug,
    subcategoryName: subcategory?.name ?? before?.subcategoryName,
  });
  if (!parsed.ok) {
    return { fieldErrors: parsed.fieldErrors, error: "Проверьте форму." };
  }

  try {
    await updateProduct(id, parsed.payload);
  } catch (error) {
    console.error("[products] update failed", error);
    return { error: humanizeError(error) };
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  const after = await getProductById(id);
  revalidateProductPublicPaths(before, after);
  await settleRevalidation();
  const slugChanged = Boolean(before && after && before.slug !== after.slug);
  return {
    success: slugChanged
      ? "Изменения сохранены. Ссылка товара обновлена — старый адрес автоматически ведёт на новый. Сайт может обновиться в течение нескольких минут."
      : "Изменения сохранены. Публичный сайт может обновиться в течение нескольких минут.",
    savedAt: new Date().toISOString(),
  };
}

export async function deleteProductAction(
  id: number,
  formData: FormData,
): Promise<void> {
  await requireAdmin("/admin/products");
  const rawReturnTo = String(formData.get("returnTo") ?? "").trim();
  const returnTo = safeReturnTo(rawReturnTo, "/admin/products");
  const before = await getProductById(id);
  try {
    await deleteProduct(id);
  } catch (error) {
    console.error("[products] delete failed", error);
    redirect(withStatusParam(returnTo, "error", "Не удалось удалить товар. Проверьте связанные данные и попробуйте ещё раз."));
  }
  revalidatePath("/admin/products");
  revalidateProductPublicPaths(before);
  await settleRevalidation();
  redirect(withStatusParam(returnTo, "msg", "Товар удалён. Он исчез с сайта, поиска, sitemap и витрины."));
}

function revalidateProductPublicPaths(
  ...products: Array<ProductDetail | null | undefined>
) {
  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/catalog");
  revalidatePath("/catalog", "layout");
  revalidatePath("/about");
  revalidatePath("/sitemap.xml");

  for (const product of products) {
    if (!product) continue;
    const publicProduct = productDetailToPublicCatalogProduct(product);
    const view = buildPublicProductView(publicProduct);
    revalidatePath(`/catalog/${product.slug}`);
    revalidatePath(`/tovar/${product.slug}`);
    revalidatePath(view.canonicalPath);
    for (const path of getRelatedSeoLandingPaths(product, publicProduct, view.canonicalPath)) {
      revalidatePath(path);
    }
    if (product.categorySlug) {
      revalidatePath(catalogCategoryPath(product.categorySlug));
      revalidatePath(`/catalog/category/${product.categorySlug}`);
    }
    if (product.subcategorySlug && product.categorySlug) {
      revalidatePath(catalogSubcategoryPath(product.categorySlug, product.subcategorySlug));
    }
    if (product.subcategorySlug) {
      revalidatePath(`/catalog/subcategory/${product.subcategorySlug}`);
    }
  }
}

function getRelatedSeoLandingPaths(
  product: ProductDetail,
  publicProduct: ReturnType<typeof productDetailToPublicCatalogProduct>,
  canonicalPath: string,
): string[] {
  const paths = new Set<string>();
  const gateValvePage = getGateValveSeoPageForProduct(publicProduct);
  if (gateValvePage) {
    paths.add(`/${gateValvePage.categorySlug}/${gateValvePage.slug}`);
  }

  const categorySlug = product.categorySlug || publicProduct.category;
  const productSlug = product.slug.toLowerCase();
  const canonical = canonicalPath.toLowerCase();
  for (const landingPage of CATALOG_LANDING_PAGES) {
    if (landingPage.categorySlug !== categorySlug) continue;
    const landingSlug = landingPage.slug.toLowerCase();
    if (productSlug.includes(landingSlug) || canonical.includes(`/${categorySlug}/${landingSlug}`)) {
      paths.add(`/${landingPage.categorySlug}/${landingPage.slug}`);
    }
  }

  return [...paths];
}

function withStatusParam(href: string, key: "msg" | "error", value: string): string {
  const [path, query = ""] = href.split("?");
  const params = new URLSearchParams(query);
  params.set(key, value);
  return `${path}?${params.toString()}`;
}

function humanizeError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes("products_slug_idx")) {
    return "Товар с такой ссылкой уже есть.";
  }
  if (msg.includes("selected images do not exist")) {
    return "Некоторые изображения были удалены. Обновите страницу и попробуйте снова.";
  }
  if (msg.includes("selected documents do not exist")) {
    return "Некоторые документы были удалены. Обновите страницу и попробуйте снова.";
  }
  if (msg.includes("Invalid document format")) {
    return "Для документов товара доступны только PDF, DOC, DOCX, XLS и XLSX.";
  }
  return "Не удалось сохранить товар. Попробуйте ещё раз.";
}
