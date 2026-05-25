import "server-only";

import {
  getPublicCatalogListingProducts,
  getPublicCatalogRuntimeInfo,
} from "@/lib/public-catalog";
import type { PublicCatalogProduct } from "@/lib/public-catalog/types";

import { searchProductsInDatabase } from "./product-search-db";
import { searchPublicProducts } from "./product-search";

/**
 * Header autocomplete product search.
 * DB: SQL + LIMIT. JSON: legacy in-memory listing scan (unchanged behavior).
 */
export async function searchHeaderProducts(
  rawQ: string,
  limit: number,
): Promise<PublicCatalogProduct[]> {
  const q = rawQ.trim();
  if (!q) return [];

  const { effectiveSource } = getPublicCatalogRuntimeInfo();
  if (effectiveSource === "db") {
    return searchProductsInDatabase(q, limit);
  }

  const products = await getPublicCatalogListingProducts();
  const qLower = q.toLowerCase();
  const slugHit = products.find((p) => p.slug.toLowerCase() === qLower);
  const pool = slugHit ? products.filter((p) => p.id !== slugHit.id) : products;
  const limitAfterHit = slugHit ? Math.max(0, limit - 1) : limit;
  const hits = searchPublicProducts(pool, q, limitAfterHit);
  return slugHit ? [slugHit, ...hits].slice(0, limit) : hits;
}
