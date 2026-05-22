"use server";

import { z } from "zod";

import { requireAdmin } from "@/lib/auth/current-user";
import { applyProductsImport, type ApplyImportResult } from "@/lib/products-import/apply";
import {
  MAX_IMPORT_FILE_BYTES,
  MAX_IMPORT_ROWS,
} from "@/lib/products-import/columns";
import { parseProductsImportWorkbook } from "@/lib/products-import/parser";
import {
  buildImportPreview,
  type ImportPreview,
  type ImportRowPayload,
} from "@/lib/products-import/preview";

export type ImportPreviewState = {
  error?: string;
  preview?: ImportPreview;
  payloadsJson?: string;
};

export type ImportApplyState = {
  error?: string;
  result?: ApplyImportResult;
};

export async function previewProductsImportAction(
  _prev: ImportPreviewState,
  formData: FormData,
): Promise<ImportPreviewState> {
  await requireAdmin("/admin/products/import");

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Выберите файл .xlsx с товарами." };
  }
  if (file.size > MAX_IMPORT_FILE_BYTES) {
    return {
      error: `Файл слишком большой (максимум ${Math.round(MAX_IMPORT_FILE_BYTES / (1024 * 1024))} МБ).`,
    };
  }
  const name = file.name.toLowerCase();
  if (!name.endsWith(".xlsx")) {
    return { error: "Поддерживается только формат .xlsx (Excel)." };
  }

  let buffer: ArrayBuffer;
  try {
    buffer = await file.arrayBuffer();
  } catch (error) {
    console.error("[products-import] read failed", error);
    return { error: "Не удалось прочитать файл." };
  }

  let parsed;
  try {
    parsed = await parseProductsImportWorkbook(buffer);
  } catch (error) {
    console.error("[products-import] parse failed", error);
    return { error: "Не удалось распарсить Excel — проверьте формат шаблона." };
  }

  if (!parsed.rows.length) {
    return { error: "В файле нет строк с товарами. Проверьте шаблон." };
  }

  let preview: ImportPreview;
  try {
    preview = await buildImportPreview(parsed.rows, {
      unknownHeaders: parsed.unknownHeaders,
      truncated: parsed.truncated,
    });
  } catch (error) {
    console.error("[products-import] preview failed", error);
    return { error: "Не удалось построить превью импорта." };
  }

  const payloads: ImportRowPayload[] = preview.rows
    .map((row) => row.payload)
    .filter((p): p is ImportRowPayload => Boolean(p));

  return {
    preview,
    payloadsJson: JSON.stringify(payloads),
  };
}

const payloadSchema = z.object({
  rowNumber: z.number().int(),
  mode: z.enum(["create", "update"]),
  productId: z.number().int().positive().optional(),
  slug: z.string().min(1),
  name: z.string().min(1),
  publicTitle: z.string().nullable(),
  categoryId: z.number().int().positive(),
  subcategoryId: z.number().int().positive().nullable(),
  model: z.string().nullable(),
  dn: z.number().int().nullable(),
  pn: z.number().int().nullable(),
  material: z.string().nullable(),
  connectionType: z.string().nullable(),
  controlType: z.string().nullable(),
  price: z.string().nullable(),
  priceByRequest: z.boolean(),
  weight: z.string().nullable(),
  shortDescription: z.string().nullable(),
  longDescription: z.string().nullable(),
  detailBlocks: z.object({
    standards: z.array(z.string()),
    benefits: z.array(z.string()),
    applications: z.array(z.string()),
    qualityDocuments: z.array(z.string()),
    supplyTerms: z.array(z.string()),
  }),
  isActive: z.boolean(),
  imageMediaId: z.string().nullable(),
});

export async function applyProductsImportAction(
  _prev: ImportApplyState,
  formData: FormData,
): Promise<ImportApplyState> {
  await requireAdmin("/admin/products/import");
  const raw = String(formData.get("payloads") ?? "");
  if (!raw) return { error: "Нет данных для применения. Сначала загрузите файл и постройте превью." };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { error: "Не удалось прочитать данные превью." };
  }
  if (!Array.isArray(parsed)) {
    return { error: "Некорректные данные превью." };
  }
  if (parsed.length === 0) {
    return { error: "В превью нет строк, готовых к применению." };
  }
  if (parsed.length > MAX_IMPORT_ROWS) {
    return { error: `Слишком много строк (максимум ${MAX_IMPORT_ROWS}).` };
  }

  const payloads: ImportRowPayload[] = [];
  for (const item of parsed) {
    const validated = payloadSchema.safeParse(item);
    if (!validated.success) {
      return { error: "Некорректная строка в данных превью — пересоберите превью." };
    }
    payloads.push(validated.data);
  }

  try {
    const result = await applyProductsImport(payloads);
    return { result };
  } catch (error) {
    console.error("[products-import] apply failed", error);
    return { error: "Не удалось применить импорт. Попробуйте ещё раз." };
  }
}
