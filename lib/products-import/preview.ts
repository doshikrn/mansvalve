import "server-only";

import { inArray, like, or } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import {
  mediaAssets as mediaAssetsTable,
  products as productsTable,
} from "@/lib/db/schema";
import { listCategoriesWithSubcategories } from "@/lib/services/categories";
import { slugify } from "@/lib/services/slug";

import { buildProductSlug } from "./slug-builder";
import type { ImportColumnKey } from "./columns";
import type { ParsedImportRow } from "./parser";

export type ImportRowAction = "create" | "update" | "skip" | "error";

export interface ImportPreviewRow {
  rowNumber: number;
  action: ImportRowAction;
  errors: string[];
  warnings: string[];
  /** Сериализуемый payload для последующего применения (если action !== error). */
  payload?: ImportRowPayload;
  /** Что будет на сайте после импорта — полезно показать в превью. */
  display: {
    name: string;
    slug: string;
    categoryName: string;
    subcategoryName: string;
    seoTitle: string;
    seoDescription: string;
    imageStatus: "matched" | "missing" | "none";
    publication: "active" | "hidden";
  };
}

export interface ImportRowPayload {
  rowNumber: number;
  mode: "create" | "update";
  productId?: number;
  slug: string;
  name: string;
  publicTitle: string | null;
  categoryId: number;
  subcategoryId: number | null;
  model: string | null;
  dn: number | null;
  pn: number | null;
  material: string | null;
  connectionType: string | null;
  controlType: string | null;
  price: string | null;
  priceByRequest: boolean;
  weight: string | null;
  shortDescription: string | null;
  longDescription: string | null;
  detailBlocks: {
    standards: string[];
    benefits: string[];
    applications: string[];
    qualityDocuments: string[];
    supplyTerms: string[];
  };
  isActive: boolean;
  imageMediaId: string | null;
}

export interface ImportPreviewSummary {
  total: number;
  create: number;
  update: number;
  skip: number;
  error: number;
  unknownHeaders: string[];
  truncated: boolean;
}

export interface ImportPreview {
  rows: ImportPreviewRow[];
  summary: ImportPreviewSummary;
}

const STATUS_ACTIVE = new Set(["active", "активен", "видим", "видимый", "true", "1", "yes", "да"]);
const STATUS_HIDDEN = new Set(["hidden", "скрыт", "скрытый", "off", "false", "0", "no", "нет"]);

function val(values: Partial<Record<ImportColumnKey, string>>, key: ImportColumnKey): string {
  return values[key]?.trim() ?? "";
}

function parseListField(raw: string): string[] {
  if (!raw) return [];
  return raw
    .split(/[\r\n]+|;\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseIntOrNull(raw: string): number | null {
  if (!raw) return null;
  const n = Number.parseInt(raw.replace(/\s+/g, ""), 10);
  return Number.isFinite(n) ? n : null;
}

function parseNumericOrNull(raw: string): string | null {
  if (!raw) return null;
  const normalized = raw.replace(",", ".").replace(/\s+/g, "");
  const n = Number.parseFloat(normalized);
  if (!Number.isFinite(n) || n < 0) return null;
  return String(n);
}

function extractFilenameCandidate(raw: string): string {
  // url → последний сегмент, без query.
  const stripped = raw.split("?")[0].split("#")[0];
  const slash = stripped.lastIndexOf("/");
  return (slash >= 0 ? stripped.slice(slash + 1) : stripped).trim();
}

export async function buildImportPreview(
  rows: ParsedImportRow[],
  options: { unknownHeaders?: string[]; truncated?: boolean } = {},
): Promise<ImportPreview> {
  const categories = await listCategoriesWithSubcategories();
  const categoryByKey = new Map<string, (typeof categories)[number]>();
  for (const category of categories) {
    categoryByKey.set(category.slug.toLowerCase(), category);
    categoryByKey.set(category.name.trim().toLowerCase(), category);
  }

  const db = getDb();

  // Заранее агрегируем все потенциальные slug'и и filename'ы для одного запроса.
  const wantedSlugs = new Set<string>();
  const wantedFiles = new Set<string>();

  type Prep = {
    row: ParsedImportRow;
    slug: string;
    category?: (typeof categories)[number];
    subcategoryId: number | null;
    subcategoryName: string;
    earlyErrors: string[];
    warnings: string[];
    dn: number | null;
    pn: number | null;
    price: string | null;
    weight: string | null;
    imageQuery: string;
    isActive: boolean;
  };

  const prep: Prep[] = rows.map((row) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    const name = val(row.values, "name");
    if (!name) errors.push("Нет названия (колонка «Название»).");

    const categoryRaw = val(row.values, "category");
    if (!categoryRaw) errors.push("Не указана категория.");
    const category = categoryRaw
      ? categoryByKey.get(categoryRaw.toLowerCase())
      : undefined;
    if (categoryRaw && !category) {
      errors.push(`Категория не найдена: «${categoryRaw}».`);
    }

    const subcategoryRaw = val(row.values, "subcategory");
    let subcategoryId: number | null = null;
    let subcategoryName = "";
    if (category && subcategoryRaw) {
      const sub = category.subcategories.find(
        (s) =>
          s.slug.toLowerCase() === subcategoryRaw.toLowerCase() ||
          s.name.trim().toLowerCase() === subcategoryRaw.toLowerCase(),
      );
      if (!sub) {
        errors.push(
          `Подкатегория «${subcategoryRaw}» не найдена внутри категории «${category.name}».`,
        );
      } else {
        subcategoryId = sub.id;
        subcategoryName = sub.name;
      }
    } else if (subcategoryRaw && !category) {
      warnings.push(`Подкатегория «${subcategoryRaw}» проигнорирована — нет валидной категории.`);
    }

    const dn = parseIntOrNull(val(row.values, "dn"));
    if (val(row.values, "dn") && dn == null) errors.push("DN должен быть числом.");
    const pn = parseIntOrNull(val(row.values, "pn"));
    if (val(row.values, "pn") && pn == null) errors.push("PN должен быть числом.");

    const priceRaw = val(row.values, "price");
    const price = parseNumericOrNull(priceRaw);
    if (priceRaw && price == null) errors.push("Цена должна быть положительным числом.");

    const weightRaw = val(row.values, "weight");
    const weight = parseNumericOrNull(weightRaw);
    if (weightRaw && weight == null) errors.push("Вес должен быть положительным числом.");

    const slug = buildProductSlug({
      name,
      model: val(row.values, "model"),
      dn,
      pn,
    });
    if (!slug) errors.push("Не удалось сформировать slug — заполните название или модель.");
    else wantedSlugs.add(slug);

    const imageQuery = extractFilenameCandidate(val(row.values, "imageFilename"));
    if (imageQuery) wantedFiles.add(imageQuery);

    const statusRaw = val(row.values, "publicationStatus").toLowerCase();
    let isActive = true;
    if (statusRaw) {
      if (STATUS_ACTIVE.has(statusRaw)) isActive = true;
      else if (STATUS_HIDDEN.has(statusRaw)) isActive = false;
      else warnings.push(`Статус «${statusRaw}» не распознан — применён «active».`);
    }

    return {
      row,
      slug,
      category,
      subcategoryId,
      subcategoryName,
      earlyErrors: errors,
      warnings,
      dn,
      pn,
      price,
      weight,
      imageQuery,
      isActive,
    };
  });

  const existingBySlug = new Map<
    string,
    { id: number; slug: string; publicTitle: string | null; shortDescription: string | null }
  >();
  if (wantedSlugs.size) {
    const found = await db
      .select({
        id: productsTable.id,
        slug: productsTable.slug,
        publicTitle: productsTable.publicTitle,
        shortDescription: productsTable.shortDescription,
      })
      .from(productsTable)
      .where(inArray(productsTable.slug, Array.from(wantedSlugs)));
    for (const product of found) {
      existingBySlug.set(product.slug, product);
    }
  }

  const mediaByQuery = new Map<string, string>();
  if (wantedFiles.size) {
    const queries = Array.from(wantedFiles);
    const found = await db
      .select({
        id: mediaAssetsTable.id,
        storageKey: mediaAssetsTable.storageKey,
        url: mediaAssetsTable.url,
      })
      .from(mediaAssetsTable)
      .where(
        or(
          ...queries.flatMap((q) => [
            like(mediaAssetsTable.storageKey, `%${q}`),
            like(mediaAssetsTable.url, `%${q}`),
          ]),
        ),
      );
    for (const asset of found) {
      for (const query of queries) {
        if (asset.storageKey.endsWith(query) || asset.url.endsWith(query)) {
          if (!mediaByQuery.has(query)) mediaByQuery.set(query, asset.id);
        }
      }
    }
  }

  // Защита от дубликатов внутри файла.
  const slugCountInFile = new Map<string, number>();
  for (const p of prep) {
    if (!p.slug) continue;
    slugCountInFile.set(p.slug, (slugCountInFile.get(p.slug) ?? 0) + 1);
  }

  const previewRows: ImportPreviewRow[] = prep.map((p) => {
    const errors = [...p.earlyErrors];
    const warnings = [...p.warnings];

    if (p.slug && (slugCountInFile.get(p.slug) ?? 0) > 1) {
      errors.push(`Slug «${p.slug}» повторяется в этом файле — дубль не создадим.`);
    }

    const existing = p.slug ? existingBySlug.get(p.slug) : undefined;
    let imageMediaId: string | null = null;
    let imageStatus: "matched" | "missing" | "none" = "none";
    if (p.imageQuery) {
      const found = mediaByQuery.get(p.imageQuery);
      if (found) {
        imageMediaId = found;
        imageStatus = "matched";
      } else {
        imageStatus = "missing";
        warnings.push(
          `Изображение «${p.imageQuery}» не найдено в медиатеке — товар будет без картинки.`,
        );
      }
    }

    const name = val(p.row.values, "name");
    const model = val(p.row.values, "model");
    const seoTitle = `${name} купить в Казахстане | MANSVALVE GROUP`;
    const seoDescription = buildAutoSeoDescription({
      name,
      dn: p.dn,
      pn: p.pn,
    });

    const action: ImportRowAction = errors.length
      ? "error"
      : existing
        ? "update"
        : "create";

    const display = {
      name,
      slug: p.slug,
      categoryName: p.category?.name ?? "—",
      subcategoryName: p.subcategoryName || (p.category && !val(p.row.values, "subcategory") ? "—" : ""),
      seoTitle,
      seoDescription,
      imageStatus,
      publication: p.isActive ? ("active" as const) : ("hidden" as const),
    };

    if (action === "error") {
      return { rowNumber: p.row.rowNumber, action, errors, warnings, display };
    }

    const priceByRequest = p.price == null;

    const payload: ImportRowPayload = {
      rowNumber: p.row.rowNumber,
      mode: existing ? "update" : "create",
      productId: existing?.id,
      slug: p.slug,
      name,
      publicTitle: existing?.publicTitle ?? null,
      categoryId: p.category!.id,
      subcategoryId: p.subcategoryId,
      model: model || null,
      dn: p.dn,
      pn: p.pn,
      material: val(p.row.values, "material") || null,
      connectionType: val(p.row.values, "connectionType") || null,
      controlType: val(p.row.values, "controlType") || null,
      price: p.price,
      priceByRequest,
      weight: p.weight,
      shortDescription: val(p.row.values, "shortDescription") || null,
      longDescription: val(p.row.values, "longDescription") || null,
      detailBlocks: {
        standards: parseListField(val(p.row.values, "standards")),
        benefits: parseListField(val(p.row.values, "benefits")),
        applications: parseListField(val(p.row.values, "applications")),
        qualityDocuments: parseListField(val(p.row.values, "qualityDocuments")),
        supplyTerms: parseListField(val(p.row.values, "supplyTerms")),
      },
      isActive: p.isActive,
      imageMediaId,
    };

    if (existing) {
      warnings.push(
        `Товар уже существует (id ${existing.id}). Будут перезаписаны параметры/описания/категория; ручные SEO-поля (publicTitle, H1) НЕ затрагиваются.`,
      );
    }

    return { rowNumber: p.row.rowNumber, action, errors, warnings, payload, display };
  });

  const summary: ImportPreviewSummary = {
    total: previewRows.length,
    create: previewRows.filter((row) => row.action === "create").length,
    update: previewRows.filter((row) => row.action === "update").length,
    skip: previewRows.filter((row) => row.action === "skip").length,
    error: previewRows.filter((row) => row.action === "error").length,
    unknownHeaders: options.unknownHeaders ?? [],
    truncated: Boolean(options.truncated),
  };

  return { rows: previewRows, summary };
}

function buildAutoSeoDescription({
  name,
  dn,
  pn,
}: {
  name: string;
  dn: number | null;
  pn: number | null;
}): string {
  const params: string[] = [];
  if (dn != null) params.push(`DN ${dn}`);
  if (pn != null) params.push(`PN ${pn}`);
  const paramsText = params.length ? ` с ${params.join(" ")}` : "";
  return `${name}${paramsText} для промышленных трубопроводов. Доставка по Казахстану, документы, сертификаты и подготовка КП.`;
}

// Подсказка eslint: slugify используется через buildProductSlug, явный re-export не нужен.
export { slugify };
