import "server-only";

import { sql } from "drizzle-orm";

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

export type HealthIssueId =
  | "missing_image"
  | "missing_public_title"
  | "missing_short_description"
  | "missing_specs_and_blocks"
  | "missing_subcategory"
  | "fallback_only_series"
  | "duplicate_canonical"
  | "duplicate_seo_title"
  | "series_drift"
  | "orphan_alias";

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

export type CatalogHealthReport = {
  totalProducts: number;
  inactiveProducts: number;
  totalAliases: number;
  metrics: HealthMetric[];
  generatedAt: string;
};

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

/**
 * Lightweight catalog audit. Does not stream — runs a handful of indexed counts
 * + one in-memory pass over the active product list to compute per-product
 * issues. Admin-only.
 */
export async function getCatalogHealthReport(): Promise<CatalogHealthReport> {
  const db = getDb();

  const [totalRow] = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(productsTable);
  const totalProducts = totalRow?.value ?? 0;

  const [inactiveRow] = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(productsTable)
    .where(sql`${productsTable.isActive} = false`);
  const inactiveProducts = inactiveRow?.value ?? 0;

  const [aliasRow] = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(productSlugAliasesTable);
  const totalAliases = aliasRow?.value ?? 0;

  const products = await getPublicCatalogProducts();

  const buckets: Record<HealthIssueId, HealthIssue[]> = {
    missing_image: [],
    missing_public_title: [],
    missing_short_description: [],
    missing_specs_and_blocks: [],
    missing_subcategory: [],
    fallback_only_series: [],
    duplicate_canonical: [],
    duplicate_seo_title: [],
    series_drift: [],
    orphan_alias: [],
  };
  const counts: Record<HealthIssueId, number> = {
    missing_image: 0,
    missing_public_title: 0,
    missing_short_description: 0,
    missing_specs_and_blocks: 0,
    missing_subcategory: 0,
    fallback_only_series: 0,
    duplicate_canonical: 0,
    duplicate_seo_title: 0,
    series_drift: 0,
    orphan_alias: 0,
  };

  const canonicalMap = new Map<string, HealthIssue[]>();
  const seoTitleMap = new Map<string, HealthIssue[]>();

  for (const product of products) {
    const meta = describeProduct(product);
    const view = buildPublicProductView(product);

    if (!product.primaryImageUrl) {
      counts.missing_image += 1;
      if (buckets.missing_image.length < SAMPLE_LIMIT) {
        buckets.missing_image.push({ id: "missing_image", ...meta });
      }
    }
    if (!product.publicTitle?.trim()) {
      counts.missing_public_title += 1;
      if (buckets.missing_public_title.length < SAMPLE_LIMIT) {
        buckets.missing_public_title.push({
          id: "missing_public_title",
          ...meta,
          detail: "Используется автогенерируемое имя",
        });
      }
    }
    if (!product.shortDescription?.trim()) {
      counts.missing_short_description += 1;
      if (buckets.missing_short_description.length < SAMPLE_LIMIT) {
        buckets.missing_short_description.push({
          id: "missing_short_description",
          ...meta,
        });
      }
    }
    const specsCount = Object.keys(product.specs ?? {}).length;
    const detailBlocksHasContent =
      product.detailBlocks &&
      Object.values(product.detailBlocks).some(
        (v) => Array.isArray(v) && v.length > 0,
      );
    if (specsCount === 0 && !detailBlocksHasContent) {
      counts.missing_specs_and_blocks += 1;
      if (buckets.missing_specs_and_blocks.length < SAMPLE_LIMIT) {
        buckets.missing_specs_and_blocks.push({
          id: "missing_specs_and_blocks",
          ...meta,
        });
      }
    }
    if (!product.subcategory) {
      counts.missing_subcategory += 1;
      if (buckets.missing_subcategory.length < SAMPLE_LIMIT) {
        buckets.missing_subcategory.push({
          id: "missing_subcategory",
          ...meta,
        });
      }
    }

    const template = getProductSeriesTemplate(product);
    if (template) {
      const drift = computeSeriesDrift(product, template);
      if (drift.isFullFallback) {
        counts.fallback_only_series += 1;
        if (buckets.fallback_only_series.length < SAMPLE_LIMIT) {
          buckets.fallback_only_series.push({
            id: "fallback_only_series",
            ...meta,
            detail: drift.templateLabel,
          });
        }
      } else if (drift.hasDrift) {
        counts.series_drift += 1;
        if (buckets.series_drift.length < SAMPLE_LIMIT) {
          const overridden = drift.blocks
            .filter((b) => b.state === "override" || b.state === "partial")
            .map((b) => b.key)
            .join(", ");
          buckets.series_drift.push({
            id: "series_drift",
            ...meta,
            detail: `override: ${overridden}`,
          });
        }
      }
    }

    // Canonical / SEO title duplicates: aggregate first, count after.
    const canonicalBucket = canonicalMap.get(view.canonicalPath) ?? [];
    canonicalBucket.push({ id: "duplicate_canonical", ...meta });
    canonicalMap.set(view.canonicalPath, canonicalBucket);

    const seoTitleKey = view.seoTitle.trim().toLowerCase();
    if (seoTitleKey) {
      const seoBucket = seoTitleMap.get(seoTitleKey) ?? [];
      seoBucket.push({ id: "duplicate_seo_title", ...meta });
      seoTitleMap.set(seoTitleKey, seoBucket);
    }
  }

  for (const [path, occurrences] of canonicalMap) {
    if (occurrences.length < 2) continue;
    counts.duplicate_canonical += occurrences.length;
    for (const occurrence of occurrences) {
      if (buckets.duplicate_canonical.length >= SAMPLE_LIMIT) break;
      buckets.duplicate_canonical.push({ ...occurrence, detail: path });
    }
  }

  for (const [title, occurrences] of seoTitleMap) {
    if (occurrences.length < 2) continue;
    counts.duplicate_seo_title += occurrences.length;
    for (const occurrence of occurrences) {
      if (buckets.duplicate_seo_title.length >= SAMPLE_LIMIT) break;
      buckets.duplicate_seo_title.push({
        ...occurrence,
        detail: title.slice(0, 80),
      });
    }
  }

  // Orphan slug aliases: alias whose product no longer exists. FK CASCADE
  // should prevent it, but if a row sneaks in (e.g. via direct SQL or schema
  // skew), surface it here.
  const orphanAliasRows = await db
    .select({
      slug: productSlugAliasesTable.slug,
      productId: productSlugAliasesTable.productId,
    })
    .from(productSlugAliasesTable)
    .leftJoin(productsTable, sql`${productsTable.id} = ${productSlugAliasesTable.productId}`)
    .where(sql`${productsTable.id} IS NULL`)
    .limit(SAMPLE_LIMIT * 4);
  counts.orphan_alias = orphanAliasRows.length;
  for (const row of orphanAliasRows.slice(0, SAMPLE_LIMIT)) {
    buckets.orphan_alias.push({
      id: "orphan_alias",
      detail: `${row.slug} (product_id=${row.productId})`,
    });
  }

  const metrics: HealthMetric[] = [
    {
      id: "missing_image",
      label: "Товары без изображения",
      severity: "warn",
      count: counts.missing_image,
      samples: buckets.missing_image,
    },
    {
      id: "missing_public_title",
      label: "Без «Названия на сайте» (используется автоген)",
      severity: "info",
      count: counts.missing_public_title,
      samples: buckets.missing_public_title,
    },
    {
      id: "missing_short_description",
      label: "Без краткого описания",
      severity: "warn",
      count: counts.missing_short_description,
      samples: buckets.missing_short_description,
    },
    {
      id: "missing_specs_and_blocks",
      label: "Без specs и без detail_blocks",
      severity: "warn",
      count: counts.missing_specs_and_blocks,
      samples: buckets.missing_specs_and_blocks,
    },
    {
      id: "missing_subcategory",
      label: "Без подкатегории",
      severity: "warn",
      count: counts.missing_subcategory,
      samples: buckets.missing_subcategory,
    },
    {
      id: "fallback_only_series",
      label: "В серии, полностью на шаблонном fallback",
      severity: "info",
      count: counts.fallback_only_series,
      samples: buckets.fallback_only_series,
    },
    {
      id: "series_drift",
      label: "Расхождения с шаблоном серии (drift)",
      severity: "info",
      count: counts.series_drift,
      samples: buckets.series_drift,
    },
    {
      id: "duplicate_canonical",
      label: "Дубликаты canonical URL",
      severity: "critical",
      count: counts.duplicate_canonical,
      samples: buckets.duplicate_canonical,
    },
    {
      id: "duplicate_seo_title",
      label: "Дубликаты SEO title",
      severity: "warn",
      count: counts.duplicate_seo_title,
      samples: buckets.duplicate_seo_title,
    },
    {
      id: "orphan_alias",
      label: "Сиротские slug-алиасы (orphan)",
      severity: "critical",
      count: counts.orphan_alias,
      samples: buckets.orphan_alias,
    },
  ];

  return {
    totalProducts,
    inactiveProducts,
    totalAliases,
    metrics,
    generatedAt: new Date().toISOString(),
  };
}
