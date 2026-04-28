import type { PublicCatalogProduct } from "@/lib/public-catalog";

export function pickProductsBySlugs(
  products: PublicCatalogProduct[],
  slugs: string[],
  limit: number,
): PublicCatalogProduct[] {
  const bySlug = new Map(products.map((product) => [product.slug, product]));
  const picked: PublicCatalogProduct[] = [];
  const used = new Set<string>();

  for (const slug of slugs) {
    const product = bySlug.get(slug);
    if (!product || used.has(product.slug)) continue;
    picked.push(product);
    used.add(product.slug);
    if (picked.length >= limit) return picked;
  }

  for (const product of products) {
    if (used.has(product.slug)) continue;
    picked.push(product);
    used.add(product.slug);
    if (picked.length >= limit) return picked;
  }

  return picked;
}
