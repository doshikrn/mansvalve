import type { PublicCatalogProduct } from "@/lib/public-catalog";
import {
  EMPTY_PRODUCT_DETAIL_BLOCKS,
  normalizeProductDetailBlocks,
  type ProductDetailBlocks,
  type ProductDetailBlockKey,
} from "@/lib/product-detail-blocks";
import {
  getSeriesPageGroupKey,
  getSeriesPageGroupLabel,
  getSeriesPagePath,
  getSeriesSeoPageForProduct,
  PRODUCT_SERIES_SEO_PAGES,
  type ProductSeriesSeoPage,
} from "@/lib/seo-product-pages/product-series";

/**
 * Series inheritance model
 * ------------------------
 * Public catalog already builds product content via `buildPublicProductView` →
 * `buildProductDetailContent`, which falls back to the gate-valve SEO page
 * blocks when the SKU has no `detail_blocks` override. This module exposes the
 * same inheritance contract explicitly so the admin can audit and bulk-apply
 * template defaults without touching `buildPublicProductView`.
 *
 *   Series Template
 *     ↓
 *   SKU (`products.detail_blocks` — nullable, partial overrides allowed)
 *     ↓
 *   Public view (`buildPublicProductView` merges SKU + template)
 */

export const SERIES_SHARED_BLOCK_KEYS: ProductDetailBlockKey[] = [
  "standards",
  "benefits",
  "applications",
  "qualityDocuments",
  "supplyTerms",
];

export type SeriesBlockState = "inherited" | "match" | "partial" | "override";

export type SeriesBlockStatus = {
  key: ProductDetailBlockKey;
  state: SeriesBlockState;
  templateCount: number;
  productCount: number;
  /** Items present in product but not in template (potential drift). */
  extra: string[];
  /** Items present in template but missing from product. */
  missing: string[];
};

export type SeriesDrift = {
  templateSlug: string;
  templateLabel: string;
  blocks: SeriesBlockStatus[];
  /** True if any shared block is `override` or `partial`. */
  hasDrift: boolean;
  /** True if every shared block is empty in DB (full template fallback). */
  isFullFallback: boolean;
};

export type ProductSeriesTemplate = {
  page: ProductSeriesSeoPage;
  blocks: ProductDetailBlocks;
};

/** Returns the canonical template for a product, or null when none applies. */
export function getProductSeriesTemplate(
  product: PublicCatalogProduct,
): ProductSeriesTemplate | null {
  const page = getSeriesSeoPageForProduct(product);
  if (!page) return null;
  return { page, blocks: seriesPageToBlocks(page) };
}

/** Mirrors `buildProductDetailContent`'s fallback shape for a series page. */
export function seriesPageToBlocks(page: ProductSeriesSeoPage): ProductDetailBlocks {
  return {
    standards: page.standards.slice(),
    benefits: page.benefits.slice(),
    applications: page.applications.slice(),
    qualityDocuments: page.qualityDocuments.slice(),
    supplyTerms: page.supplyTerms.slice(),
  };
}

/** Compare a product's `detail_blocks` against its series template. */
export function computeSeriesDrift(
  product: PublicCatalogProduct,
  template: ProductSeriesTemplate,
): SeriesDrift {
  const productBlocks = product.detailBlocks
    ? normalizeProductDetailBlocks(product.detailBlocks)
    : EMPTY_PRODUCT_DETAIL_BLOCKS;

  const blocks = SERIES_SHARED_BLOCK_KEYS.map<SeriesBlockStatus>((key) => {
    const templateItems = template.blocks[key];
    const productItems = productBlocks[key];
    if (productItems.length === 0) {
      return {
        key,
        state: "inherited",
        templateCount: templateItems.length,
        productCount: 0,
        extra: [],
        missing: templateItems.slice(),
      };
    }
    const templateSet = new Set(templateItems);
    const productSet = new Set(productItems);
    const extra = productItems.filter((item) => !templateSet.has(item));
    const missing = templateItems.filter((item) => !productSet.has(item));
    if (extra.length === 0 && missing.length === 0) {
      return {
        key,
        state: "match",
        templateCount: templateItems.length,
        productCount: productItems.length,
        extra: [],
        missing: [],
      };
    }
    const overlap = productItems.length - extra.length;
    const state: SeriesBlockState = overlap > 0 ? "partial" : "override";
    return {
      key,
      state,
      templateCount: templateItems.length,
      productCount: productItems.length,
      extra,
      missing,
    };
  });

  const hasDrift = blocks.some(
    (block) => block.state === "override" || block.state === "partial",
  );
  const isFullFallback = blocks.every((block) => block.state === "inherited");

  return {
    templateSlug: getSeriesPagePath(template.page),
    templateLabel: `${template.page.model} · DN${template.page.dn} · PN${template.page.pn}`,
    blocks,
    hasDrift,
    isFullFallback,
  };
}

/**
 * Returns a unique key identifying a series group (model + connectionVariant + PN).
 * Used by the admin UI to scope bulk apply operations.
 */
export function seriesGroupKey(page: ProductSeriesSeoPage): string {
  return getSeriesPageGroupKey(page);
}

export function listAllSeriesGroups(): {
  key: string;
  label: string;
  series: string;
  model: string;
  connectionVariant: string;
  pn: number;
  pages: ProductSeriesSeoPage[];
}[] {
  const map = new Map<string, ProductSeriesSeoPage[]>();
  for (const page of PRODUCT_SERIES_SEO_PAGES) {
    const key = seriesGroupKey(page);
    const list = map.get(key) ?? [];
    list.push(page);
    map.set(key, list);
  }
  return Array.from(map.entries()).map(([key, pages]) => {
    const first = pages[0];
    return {
      key,
      label: getSeriesPageGroupLabel(first),
      series: first.series,
      model: first.model,
      connectionVariant: "connectionVariant" in first ? first.connectionVariant : "default",
      pn: first.pn,
      pages,
    };
  });
}

/**
 * For each requested block, return the value that should be written when filling
 * a missing/empty block from the template. Blocks already populated in the SKU
 * are left untouched (no silent overwrite).
 */
export function buildMissingBlockPatch(
  current: ProductDetailBlocks | null | undefined,
  template: ProductDetailBlocks,
  fields: ProductDetailBlockKey[],
): { patch: Partial<ProductDetailBlocks>; filledKeys: ProductDetailBlockKey[] } {
  const normalizedCurrent = current
    ? normalizeProductDetailBlocks(current)
    : EMPTY_PRODUCT_DETAIL_BLOCKS;
  const patch: Partial<ProductDetailBlocks> = {};
  const filledKeys: ProductDetailBlockKey[] = [];
  for (const key of fields) {
    if (normalizedCurrent[key].length === 0 && template[key].length > 0) {
      patch[key] = template[key].slice();
      filledKeys.push(key);
    }
  }
  return { patch, filledKeys };
}

export const SERIES_BLOCK_LABEL: Record<ProductDetailBlockKey, string> = {
  standards: "Стандарты",
  benefits: "Преимущества",
  applications: "Применение",
  qualityDocuments: "Документация",
  supplyTerms: "Условия поставки",
};

export const SERIES_BLOCK_STATE_LABEL: Record<SeriesBlockState, string> = {
  inherited: "Заполнено автоматически",
  match: "Как в шаблоне",
  partial: "Частично отличается от шаблона",
  override: "Изменено вручную",
};
