import { notFound, permanentRedirect } from "next/navigation";

import { getPublicCatalogProducts, getPublicProductBySlug } from "@/lib/public-catalog";
import { buildPublicProductView } from "@/lib/public-catalog/product-view";

export async function generateStaticParams() {
  const products = await getPublicCatalogProducts();
  return products.map((p) => ({ slug: p.slug }));
}

/**
 * Legacy `/catalog/[slug]` product URLs: permanent redirect to the single public
 * product URL from `buildPublicProductView()` (SEO landing or `/tovar/[slug]`).
 */
export default async function LegacyCatalogProductRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getPublicProductBySlug(slug);
  if (!product) notFound();

  const view = buildPublicProductView(product);
  permanentRedirect(view.canonicalPath);
}
