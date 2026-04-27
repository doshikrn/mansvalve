import { NextResponse } from "next/server";
import { getPublicCatalogProducts } from "@/lib/public-catalog";
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

  const products = await getPublicCatalogProducts();
  const hits = searchPublicProducts(products, rawQ, limit);

  const out: ProductSearchItemDto[] = hits.map((p) => ({
    slug: p.slug,
    name: p.name,
    categoryName: p.categoryName,
    subcategoryName: p.subcategoryName,
    price: p.price ?? null,
    priceByRequest: p.priceByRequest,
    primaryImageUrl: p.primaryImageUrl?.trim() || null,
  }));

  return NextResponse.json({ products: out });
}
