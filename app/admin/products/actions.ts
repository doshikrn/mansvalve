"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/current-user";
import {
  createProduct,
  deleteProduct,
  updateProduct,
  type ProductWritePayload,
} from "@/lib/services/products";
import { slugify } from "@/lib/services/slug";

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

function parseProductForm(formData: FormData) {
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

  const data = parsed.data;
  const slug = slugify(data.slug ?? data.name);

  const payload: ProductWritePayload = {
    slug,
    name: data.name,
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

  const parsed = parseProductForm(formData);
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
  redirect(`/admin/products/${id}`);
}

export async function updateProductAction(
  id: number,
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireAdmin(`/admin/products/${id}`);

  const parsed = parseProductForm(formData);
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
  return {};
}

export async function deleteProductAction(id: number): Promise<void> {
  await requireAdmin("/admin/products");
  try {
    await deleteProduct(id);
  } catch (error) {
    console.error("[products] delete failed", error);
    throw error;
  }
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

function humanizeError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes("products_slug_idx")) {
    return "Товар с таким slug уже существует.";
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
