import type { PublicCatalogProduct } from "@/lib/public-catalog/types";

/**
 * Strip heavy fields for catalog listing, search, sitemap, and showcase picks.
 * Keeps specs + shortDescription for `buildProductQueryText` / fuzzy search parity.
 */
export function toCatalogListProduct(product: PublicCatalogProduct): PublicCatalogProduct {
  return {
    ...product,
    longDescription: undefined,
    detailBlocks: undefined,
    documents: undefined,
    images: undefined,
  };
}
