import { NextResponse } from "next/server";
import { getPublicCatalogListingProducts } from "@/lib/public-catalog";
import { buildPublicProductCardView } from "@/lib/public-catalog/product-view";
import { searchPublicProducts } from "@/lib/search/product-search";
import type { ProductSearchItemDto } from "@/lib/search/product-search-dto";

const MAX_LEN = 120;
const DEFAULT_LIMIT = 8;

/**
 * Public product search for header/autocomplete. Minimal, safe DTOs only.
 * GET /api/search/products?q=...&limit=8
 * Images: uses `primaryImageUrl` as provided by the public catalog (already resolved in DB/JSON).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawQ = (searchParams.get("q") ?? "").trim();
  if (rawQ.length > MAX_LEN) {
    return NextResponse.json({ error: "query_too_long" }, { status: 400 });
  }
  if (!rawQ) {
    return NextResponse.json({ products: [] satisfies ProductSearchItemDto[] });
  }

  const limitParam = searchParams.get("limit");
  const limit = Math.min(
    24,
    Math.max(1, limitParam ? parseInt(limitParam, 10) || DEFAULT_LIMIT : DEFAULT_LIMIT),
  );

  const products = await getPublicCatalogListingProducts();
  const qLower = rawQ.toLowerCase();
  const slugHit = products.find((p) => p.slug.toLowerCase() === qLower);
  const pool = slugHit ? products.filter((p) => p.id !== slugHit.id) : products;
  const limitAfterHit = slugHit ? Math.max(0, limit - 1) : limit;
  const hits = searchPublicProducts(pool, rawQ, limitAfterHit);
  const orderedHits = slugHit ? [slugHit, ...hits].slice(0, limit) : hits;

  const out: ProductSearchItemDto[] = orderedHits.map((p) => {
    const view = buildPublicProductCardView(p);
    return {
      slug: p.slug,
      href: view.canonicalPath,
      name: view.displayName,
      categoryName: p.categoryName,
      subcategoryName: p.subcategoryName,
      price: p.price ?? null,
      priceByRequest: p.priceByRequest,
      primaryImageUrl: view.primaryImageUrl?.trim() || null,
    };
  });

  return NextResponse.json({ products: out });
}
