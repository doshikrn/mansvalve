import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";

import {
  getPublicCatalogProducts,
  getPublicCatalogCategories,
  getPublicCategoryBySlug,
  getPublicProductBySlug,
} from "@/lib/public-catalog";
import { buildPublicProductView } from "@/lib/public-catalog/product-view";
import { buildCleanProductRedirectUrl } from "@/lib/catalog-redirect";
import { redirectLegacyCatalogProductIfNeeded } from "@/lib/catalog-legacy-product-redirect";
import {
  CatalogCategoryPage,
  getCatalogCategoryMetadata,
} from "@/components/catalog/CatalogCategoryPage";
import type { CatalogSearchParams } from "@/components/catalog/CatalogShell";

export const revalidate = 300;

/**
 * Pre-render category listings only. Legacy product slugs under `/catalog/[slug]`
 * must stay dynamic so `permanentRedirect` returns a real HTTP 308 at request time
 * (SSG product entries were served as 200 + "Перенаправление…" HTML).
 */
export async function generateStaticParams() {
  const [products, categories] = await Promise.all([
    getPublicCatalogProducts(),
    getPublicCatalogCategories(),
  ]);
  const productSlugSet = new Set(products.map((p) => p.slug));
  return categories
    .filter((c) => !productSlugSet.has(c.slug))
    .map((c) => ({ slug: c.slug }));
}

export const dynamicParams = true;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<CatalogSearchParams>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const product = await getPublicProductBySlug(slug);
  if (product) {
    const view = buildPublicProductView(product);
    permanentRedirect(buildCleanProductRedirectUrl(view.canonicalPath));
  }

  const category = await getPublicCategoryBySlug(slug);
  if (category) {
    return getCatalogCategoryMetadata(slug);
  }

  await redirectLegacyCatalogProductIfNeeded(slug);

  return { title: "Страница не найдена" };
}

/**
 * `/catalog/[slug]` обслуживает:
 * - legacy URL товара → 308 на канонический URL (`/tovar/...` или SEO-лендинг);
 * - категорию → страница `/catalog/[categorySlug]` (канонический листинг).
 */
export default async function CatalogSlugPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const query = await searchParams;

  await redirectLegacyCatalogProductIfNeeded(slug, { ...query });

  const category = await getPublicCategoryBySlug(slug);
  if (category) {
    return <CatalogCategoryPage categorySlug={slug} searchParams={searchParams} />;
  }

  notFound();
}
