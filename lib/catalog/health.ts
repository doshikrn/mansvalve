import "server-only";

import { eq, sql } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import {
  productSlugAliases as productSlugAliasesTable,
  products as productsTable,
} from "@/lib/db/schema";
import { formatProductDisplayName } from "@/lib/catalog/product-naming";
import { getPublicCatalogProducts } from "@/lib/public-catalog";
import type { PublicCatalogProduct } from "@/lib/public-catalog";
import { buildPublicProductView } from "@/lib/public-catalog/product-view";
import {
  computeSeriesDrift,
  getProductSeriesTemplate,
} from "./series-inheritance";

const HEALTH_ROUTE = "/admin/catalog-health";

function logHealth(metric: string, err: unknown, extra?: Record<string, unknown>) {
  console.error(`[admin/catalog-health] ${HEALTH_ROUTE}`, metric, extra ?? {}, err);
}

export type HealthIssueId =
  | "missing_image"
  | "missing_public_title"
  | "missing_short_description"
  | "missing_specs_and_blocks"
  | "missing_subcategory"
  | "missing_category_context"
  | "fallback_only_series"
  | "duplicate_canonical"
  | "duplicate_seo_title"
  | "series_drift"
  | "orphan_alias"
  | "hidden_products";

export type HealthIssue = {
  id: HealthIssueId;
  productId?: string;
  productSlug?: string;
  productName?: string;
  detail?: string;
};

export type HealthMetric = {
  id: HealthIssueId;
  label: string;
  severity: "info" | "warn" | "critical";
  count: number;
  samples: HealthIssue[];
};

export type CatalogHealthHeadline = {
  totalProducts: number;
  inactiveProducts: number;
  totalAliases: number;
  generatedAt: string;
  /** Когда не удалось получить сводные цифры из хранилища */
  summaryUnavailable?: boolean;
};

export type CatalogHealthMetricRow =
  | { kind: "ok"; metric: HealthMetric; hint: string }
  | { kind: "failed"; title: string; message: string };

const SAMPLE_LIMIT = 8;

function describeProduct(product: PublicCatalogProduct): {
  productId: string;
  productSlug: string;
  productName: string;
} {
  return {
    productId: product.id,
    productSlug: product.slug,
    productName:
      product.publicTitle?.trim() ||
      formatProductDisplayName(product) ||
      product.name ||
      product.slug,
  };
}

function safeBuildView(product: PublicCatalogProduct) {
  try {
    return buildPublicProductView(product);
  } catch (err) {
    logHealth("buildPublicProductView", err, { slug: product.slug });
    return null;
  }
}

async function wrapMetric(
  metricKey: string,
  title: string,
  fn: () => HealthMetric | Promise<HealthMetric>,
  hint: string,
): Promise<CatalogHealthMetricRow> {
  try {
    const metric = await fn();
    return { kind: "ok", metric, hint };
  } catch (err) {
    logHealth(metricKey, err, { action: "metric" });
    return {
      kind: "failed",
      title,
      message: "Эту проверку временно не удалось выполнить. Остальные блоки ниже должны открываться как обычно.",
    };
  }
}

async function loadHeadline(): Promise<CatalogHealthHeadline> {
  const generatedAt = new Date().toISOString();
  try {
    const db = getDb();
    const [totalRow] = await db
      .select({ value: sql<number>`count(*)::int` })
      .from(productsTable);
    const totalProducts = totalRow?.value ?? 0;

    const [inactiveRow] = await db
      .select({ value: sql<number>`count(*)::int` })
      .from(productsTable)
      .where(eq(productsTable.isActive, false));
    const inactiveProducts = inactiveRow?.value ?? 0;

    const [aliasRow] = await db
      .select({ value: sql<number>`count(*)::int` })
      .from(productSlugAliasesTable);
    const totalAliases = aliasRow?.value ?? 0;

    return {
      totalProducts,
      inactiveProducts,
      totalAliases,
      generatedAt,
    };
  } catch (err) {
    logHealth("headline_counts", err);
    return {
      totalProducts: 0,
      inactiveProducts: 0,
      totalAliases: 0,
      generatedAt,
      summaryUnavailable: true,
    };
  }
}

async function loadProducts(): Promise<PublicCatalogProduct[] | null> {
  try {
    return await getPublicCatalogProducts();
  } catch (err) {
    logHealth("getPublicCatalogProducts", err);
    return null;
  }
}

function computeMissingImage(products: PublicCatalogProduct[]): HealthMetric {
  const samples: HealthIssue[] = [];
  let count = 0;
  for (const product of products) {
    if (!product.primaryImageUrl) {
      count += 1;
      if (samples.length < SAMPLE_LIMIT) {
        samples.push({ id: "missing_image", ...describeProduct(product) });
      }
    }
  }
  return {
    id: "missing_image",
    label: "Товары без изображения",
    severity: "warn",
    count,
    samples,
  };
}

function computeMissingShortDescription(products: PublicCatalogProduct[]): HealthMetric {
  const samples: HealthIssue[] = [];
  let count = 0;
  for (const product of products) {
    if (!product.shortDescription?.trim()) {
      count += 1;
      if (samples.length < SAMPLE_LIMIT) {
        samples.push({ id: "missing_short_description", ...describeProduct(product) });
      }
    }
  }
  return {
    id: "missing_short_description",
    label: "Товары без краткого описания",
    severity: "warn",
    count,
    samples,
  };
}

function computeMissingCategoryContext(products: PublicCatalogProduct[]): HealthMetric {
  const samples: HealthIssue[] = [];
  let count = 0;
  for (const product of products) {
    const noCategory = !product.category?.trim() || !product.categoryName?.trim();
    if (noCategory) {
      count += 1;
      if (samples.length < SAMPLE_LIMIT) {
        samples.push({
          id: "missing_category_context",
          ...describeProduct(product),
          detail: "Не указан раздел каталога",
        });
      }
    }
  }
  return {
    id: "missing_category_context",
    label: "Товары без раздела каталога",
    severity: "warn",
    count,
    samples,
  };
}

function computeMissingSubcategory(products: PublicCatalogProduct[]): HealthMetric {
  const samples: HealthIssue[] = [];
  let count = 0;
  for (const product of products) {
    if (!product.subcategory?.trim()) {
      count += 1;
      if (samples.length < SAMPLE_LIMIT) {
        samples.push({ id: "missing_subcategory", ...describeProduct(product) });
      }
    }
  }
  return {
    id: "missing_subcategory",
    label: "Не выбрана подкатегория",
    severity: "warn",
    count,
    samples,
  };
}

function computeMissingSpecsAndBlocks(products: PublicCatalogProduct[]): HealthMetric {
  const samples: HealthIssue[] = [];
  let count = 0;
  for (const product of products) {
    const specsCount = Object.keys(product.specs ?? {}).length;
    const detailBlocksHasContent =
      product.detailBlocks &&
      Object.values(product.detailBlocks).some((v) => Array.isArray(v) && v.length > 0);
    if (specsCount === 0 && !detailBlocksHasContent) {
      count += 1;
      if (samples.length < SAMPLE_LIMIT) {
        samples.push({ id: "missing_specs_and_blocks", ...describeProduct(product) });
      }
    }
  }
  return {
    id: "missing_specs_and_blocks",
    label: "Нет таблицы параметров и текстовых блоков",
    severity: "warn",
    count,
    samples,
  };
}

function computeAutoTitle(products: PublicCatalogProduct[]): HealthMetric {
  const samples: HealthIssue[] = [];
  let count = 0;
  for (const product of products) {
    if (!product.publicTitle?.trim()) {
      count += 1;
      if (samples.length < SAMPLE_LIMIT) {
        samples.push({
          id: "missing_public_title",
          ...describeProduct(product),
          detail: "Подставляется автоматически из параметров",
        });
      }
    }
  }
  return {
    id: "missing_public_title",
    label: "Название на сайте не задано вручную",
    severity: "info",
    count,
    samples,
  };
}

function computeSeriesTemplateOnly(products: PublicCatalogProduct[]): HealthMetric {
  const samples: HealthIssue[] = [];
  let count = 0;
  for (const product of products) {
    const template = getProductSeriesTemplate(product);
    if (!template) continue;
    const drift = computeSeriesDrift(product, template);
    if (drift.isFullFallback) {
      count += 1;
      if (samples.length < SAMPLE_LIMIT) {
        samples.push({
          id: "fallback_only_series",
          ...describeProduct(product),
          detail: "Тексты подставляются из общего образца линейки",
        });
      }
    }
  }
  return {
    id: "fallback_only_series",
    label: "Только текст из общего образца линейки",
    severity: "info",
    count,
    samples,
  };
}

function computeSeriesDiffers(products: PublicCatalogProduct[]): HealthMetric {
  const samples: HealthIssue[] = [];
  let count = 0;
  for (const product of products) {
    const template = getProductSeriesTemplate(product);
    if (!template) continue;
    const drift = computeSeriesDrift(product, template);
    if (!drift.isFullFallback && drift.hasDrift) {
      count += 1;
      if (samples.length < SAMPLE_LIMIT) {
        const keys = drift.blocks
          .filter((b) => b.state === "override" || b.state === "partial")
          .map((b) => b.key)
          .join(", ");
        samples.push({
          id: "series_drift",
          ...describeProduct(product),
          detail: keys ? `Отличается от образца: ${keys}` : "Отличается от образца",
        });
      }
    }
  }
  return {
    id: "series_drift",
    label: "Текст отличается от образца линейки",
    severity: "info",
    count,
    samples,
  };
}

function computeDuplicateLinks(products: PublicCatalogProduct[]): HealthMetric {
  const canonicalMap = new Map<string, HealthIssue[]>();
  for (const product of products) {
    const view = safeBuildView(product);
    if (!view) continue;
    const meta = describeProduct(product);
    const bucket = canonicalMap.get(view.canonicalPath) ?? [];
    bucket.push({ id: "duplicate_canonical", ...meta });
    canonicalMap.set(view.canonicalPath, bucket);
  }
  const samples: HealthIssue[] = [];
  let count = 0;
  for (const [path, occurrences] of canonicalMap) {
    if (occurrences.length < 2) continue;
    count += occurrences.length;
    for (const occurrence of occurrences) {
      if (samples.length >= SAMPLE_LIMIT) break;
      samples.push({ ...occurrence, detail: `Один адрес для карточки: ${path}` });
    }
  }
  return {
    id: "duplicate_canonical",
    label: "Повторяющиеся основные ссылки",
    severity: "critical",
    count,
    samples,
  };
}

function computeDuplicateSearchTitles(products: PublicCatalogProduct[]): HealthMetric {
  const seoTitleMap = new Map<string, HealthIssue[]>();
  for (const product of products) {
    const view = safeBuildView(product);
    if (!view) continue;
    const key = view.seoTitle.trim().toLowerCase();
    if (!key) continue;
    const meta = describeProduct(product);
    const bucket = seoTitleMap.get(key) ?? [];
    bucket.push({ id: "duplicate_seo_title", ...meta });
    seoTitleMap.set(key, bucket);
  }
  const samples: HealthIssue[] = [];
  let count = 0;
  for (const [title, occurrences] of seoTitleMap) {
    if (occurrences.length < 2) continue;
    count += occurrences.length;
    for (const occurrence of occurrences) {
      if (samples.length >= SAMPLE_LIMIT) break;
      samples.push({
        ...occurrence,
        detail: `Один заголовок для поиска: ${title.slice(0, 80)}`,
      });
    }
  }
  return {
    id: "duplicate_seo_title",
    label: "Повторяющиеся названия для поиска",
    severity: "warn",
    count,
    samples,
  };
}

async function computeOrphanLinks(): Promise<HealthMetric> {
  const db = getDb();
  const orphanAliasRows = await db
    .select({
      slug: productSlugAliasesTable.slug,
      productId: productSlugAliasesTable.productId,
    })
    .from(productSlugAliasesTable)
    .leftJoin(productsTable, sql`${productsTable.id} = ${productSlugAliasesTable.productId}`)
    .where(sql`${productsTable.id} IS NULL`)
    .limit(SAMPLE_LIMIT * 4);

  const samples: HealthIssue[] = [];
  for (const row of orphanAliasRows.slice(0, SAMPLE_LIMIT)) {
    samples.push({
      id: "orphan_alias",
      detail: `Ссылка «${row.slug}» ведёт в никуда — карточка не найдена`,
    });
  }
  return {
    id: "orphan_alias",
    label: "Проблемы со старыми ссылками",
    severity: "critical",
    count: orphanAliasRows.length,
    samples,
  };
}

async function computeHiddenProducts(): Promise<HealthMetric> {
  const db = getDb();
  const rows = await db
    .select({
      id: productsTable.id,
      slug: productsTable.slug,
      name: productsTable.name,
      publicTitle: productsTable.publicTitle,
    })
    .from(productsTable)
    .where(eq(productsTable.isActive, false))
    .limit(SAMPLE_LIMIT);

  const [countRow] = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(productsTable)
    .where(eq(productsTable.isActive, false));
  const count = countRow?.value ?? 0;

  const samples: HealthIssue[] = rows.map((row) => ({
    id: "hidden_products" as const,
    productId: String(row.id),
    productSlug: row.slug,
    productName: row.publicTitle?.trim() || row.name || row.slug,
  }));

  return {
    id: "hidden_products",
    label: "Скрытые на сайте",
    severity: "info",
    count,
    samples,
  };
}

/**
 * Проверки каталога: каждая метрика считается отдельно; сбой одной не рушит остальные.
 */
export async function getCatalogHealthPageModel(): Promise<{
  headline: CatalogHealthHeadline;
  metrics: CatalogHealthMetricRow[];
}> {
  const headline = await loadHeadline();
  const products = await loadProducts();

  const rows: CatalogHealthMetricRow[] = [];

  rows.push(
    await wrapMetric(
      "hidden_products",
      "Скрытые на сайте",
      () => computeHiddenProducts(),
      "Клиент не видит эти карточки в каталоге.",
    ),
  );

  if (!products) {
    const fallbackMsg =
      "Список товаров для проверки сейчас недоступен. Обновите страницу через несколько секунд.";
    const blockedTitles = [
      "Товары без изображения",
      "Товары без краткого описания",
      "Товары без раздела каталога",
      "Не выбрана подкатегория",
      "Нет таблицы параметров и текстовых блоков",
      "Название на сайте не задано вручную",
      "Только текст из общего образца линейки",
      "Текст отличается от образца линейки",
      "Повторяющиеся основные ссылки",
      "Повторяющиеся названия для поиска",
    ];
    for (const title of blockedTitles) {
      rows.push({
        kind: "failed",
        title,
        message: fallbackMsg,
      });
    }
  } else {
    rows.push(
      await wrapMetric("missing_image", "Товары без изображения", () => computeMissingImage(products), "В карточке может показываться картинка из раздела."),
      await wrapMetric(
        "missing_short_description",
        "Товары без краткого описания",
        () => computeMissingShortDescription(products),
        "В списке товаров текст может подставляться автоматически.",
      ),
      await wrapMetric(
        "missing_category_context",
        "Товары без раздела каталога",
        () => computeMissingCategoryContext(products),
        "Проверьте привязку к категории.",
      ),
      await wrapMetric(
        "missing_subcategory",
        "Не выбрана подкатегория",
        () => computeMissingSubcategory(products),
        "Уточняет место в каталоге и фильтры.",
      ),
      await wrapMetric(
        "missing_specs_and_blocks",
        "Нет таблицы параметров и текстовых блоков",
        () => computeMissingSpecsAndBlocks(products),
        "На странице товара нечего показать в таблице и списках.",
      ),
      await wrapMetric(
        "missing_public_title",
        "Название на сайте не задано вручную",
        () => computeAutoTitle(products),
        "Имя для клиента собирается автоматически из параметров.",
      ),
      await wrapMetric(
        "fallback_only_series",
        "Только текст из общего образца линейки",
        () => computeSeriesTemplateOnly(products),
        "Собственные поля карточки пустые — на сайте подставляется образец.",
      ),
      await wrapMetric(
        "series_drift",
        "Текст отличается от образца линейки",
        () => computeSeriesDiffers(products),
        "Часть текста изменена вручную относительно образца.",
      ),
      await wrapMetric(
        "duplicate_canonical",
        "Повторяющиеся основные ссылки",
        () => computeDuplicateLinks(products),
        "Две карточки не должны вести на один адрес.",
      ),
      await wrapMetric(
        "duplicate_seo_title",
        "Повторяющиеся названия для поиска",
        () => computeDuplicateSearchTitles(products),
        "Поисковикам сложнее различать страницы.",
      ),
    );
  }

  rows.push(
    await wrapMetric("orphan_alias", "Проблемы со старыми ссылками", () => computeOrphanLinks(), "Обычно после удаления товара."),
  );

  return { headline, metrics: rows };
}
