import { notFound, permanentRedirect } from "next/navigation";

import { getPublicCatalogProducts, getPublicProductBySlug } from "@/lib/public-catalog";
import { buildPublicProductView } from "@/lib/public-catalog/product-view";
import { resolveProductSlugAliasTarget } from "@/lib/public-catalog/slug-aliases";

export const revalidate = 300;

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
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const product = await getPublicProductBySlug(slug);
  if (!product) {
    const aliasTarget = await resolveProductSlugAliasTarget(slug);
    if (aliasTarget) {
      permanentRedirect(`${aliasTarget}${buildQueryString(query)}`);
    }
    notFound();
  }

  const view = buildPublicProductView(product);
  permanentRedirect(`${view.canonicalPath}${buildQueryString(query)}`);
}

function buildQueryString(query: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item) params.append(key, item);
      }
      continue;
    }
    if (value) params.set(key, value);
  }
  const search = params.toString();
  return search ? `?${search}` : "";
}
