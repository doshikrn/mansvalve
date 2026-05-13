import { normalizeCatalogQuery, searchCatalogProducts } from "@/lib/catalog-query";
import type { PublicCatalogProduct } from "@/lib/public-catalog/types";

/** Same searchable fields as catalog /catalog?q=. Kept for lightweight diagnostics. */
export function buildSearchHaystack(p: PublicCatalogProduct): string {
  return [
    p.name,
    p.slug,
    p.model,
    p.material,
    p.connectionType,
    p.controlType,
    p.categoryName,
    p.subcategoryName,
    p.shortDescription,
    p.dn != null ? `dn${p.dn} ду${p.dn}` : "",
    p.pn != null ? `pn${p.pn} ру${p.pn}` : "",
    p.thread ?? "",
    Object.entries(p.specs ?? {})
      .map(([key, value]) => `${key} ${value}`)
      .join(" "),
  ]
    .join(" ")
    .toLowerCase();
}

export function productMatchesQuery(p: PublicCatalogProduct, qRaw: string): boolean {
  if (!normalizeCatalogQuery(qRaw).text) return false;
  return searchCatalogProducts([p], qRaw, 1).length > 0;
}

export function searchPublicProducts(
  products: PublicCatalogProduct[],
  q: string,
  limit = 8,
): PublicCatalogProduct[] {
  return searchCatalogProducts(products, q, limit);
}
