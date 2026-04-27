import { isFuzzyCatalogMatch } from "./fuzzy";
import type { PublicCatalogProduct } from "@/lib/public-catalog/types";

/** Same searchable fields as catalog /catalog?q= (CatalogShell). */
export function buildSearchHaystack(p: PublicCatalogProduct): string {
  return [
    p.name,
    p.model,
    p.material,
    p.connectionType,
    p.controlType,
    p.categoryName,
    p.subcategoryName,
    p.shortDescription,
    p.dn != null ? `dn${p.dn}` : "",
    p.dn != null ? String(p.dn) : "",
    p.pn != null ? `pn${p.pn}` : "",
    p.pn != null ? String(p.pn) : "",
    p.thread ?? "",
  ]
    .join(" ")
    .toLowerCase();
}

/**
 * Reuses the same match semantics as the catalog: substring OR fuzzy
 * (normalization, Latin hints, Levenshtein) — not overly broad.
 */
export function productMatchesQuery(p: PublicCatalogProduct, qRaw: string): boolean {
  const q = qRaw.trim().toLowerCase();
  if (!q) return false;
  const hay = buildSearchHaystack(p);
  if (hay.includes(q)) return true;
  return isFuzzyCatalogMatch(q, hay);
}

function relevanceRank(p: PublicCatalogProduct, q: string): number {
  const qn = q.trim().toLowerCase();
  if (!qn) return 2;
  const n = p.name.toLowerCase();
  if (n.startsWith(qn)) return 0;
  if (n.includes(qn)) return 1;
  return 2;
}

export function searchPublicProducts(
  products: PublicCatalogProduct[],
  q: string,
  limit = 8,
): PublicCatalogProduct[] {
  const trimmed = q.trim();
  if (!trimmed) return [];
  const matched = products.filter((p) => productMatchesQuery(p, trimmed));
  return [...matched]
    .sort((a, b) => {
      const r = relevanceRank(a, trimmed) - relevanceRank(b, trimmed);
      if (r !== 0) return r;
      return a.name.localeCompare(b.name, "ru");
    })
    .slice(0, limit);
}
