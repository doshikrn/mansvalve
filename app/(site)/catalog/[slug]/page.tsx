import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";

import {
  getPublicCatalogCategories,
  getPublicCatalogProducts,
  getPublicCategoryBySlug,
  getPublicProductBySlug,
} from "@/lib/public-catalog";
import { buildPublicProductView } from "@/lib/public-catalog/product-view";
import { buildCleanProductRedirectUrl } from "@/lib/catalog-redirect";
import { resolveProductSlugAliasTarget } from "@/lib/public-catalog/slug-aliases";
import {
  CatalogCategoryPage,
  getCatalogCategoryMetadata,
} from "@/components/catalog/CatalogCategoryPage";
import type { CatalogSearchParams } from "@/components/catalog/CatalogShell";

export const revalidate = 300;

export async function generateStaticParams() {
  const [products, categories] = await Promise.all([
    getPublicCatalogProducts(),
    getPublicCatalogCategories(),
  ]);
  const productSlugSet = new Set(products.map((p) => p.slug));
  const categoryParams = categories
    .filter((c) => !productSlugSet.has(c.slug))
    .map((c) => ({ slug: c.slug }));
  const productParams = products.map((p) => ({ slug: p.slug }));
  return [...productParams, ...categoryParams];
}

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<CatalogSearchParams>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [product, category] = await Promise.all([
    getPublicProductBySlug(slug),
    getPublicCategoryBySlug(slug),
  ]);

  if (product) {
    const view = buildPublicProductView(product);
    return {
      title: "Перенаправление…",
      alternates: { canonical: view.canonicalUrl },
    };
  }

  if (category) {
    return getCatalogCategoryMetadata(slug);
  }

  return { title: "Страница не найдена" };
}

/**
 * `/catalog/[slug]` обслуживает:
 * - legacy URL товара → 308 на канонический URL (`/tovar/...` или SEO-лендинг);
 * - категорию → страница `/catalog/[categorySlug]` (канонический листинг).
 */
export default async function CatalogSlugPage({ params, searchParams }: PageProps) {
  const { slug } = await params;

  const [product, category] = await Promise.all([
    getPublicProductBySlug(slug),
    getPublicCategoryBySlug(slug),
  ]);

  if (product) {
    const query = await searchParams;
    const view = buildPublicProductView(product);
    permanentRedirect(buildCleanProductRedirectUrl(view.canonicalPath, { ...query }));
  }

  if (category) {
    return <CatalogCategoryPage categorySlug={slug} searchParams={searchParams} />;
  }

  const aliasTarget = await resolveProductSlugAliasTarget(slug);
  if (aliasTarget) {
    const query = await searchParams;
    permanentRedirect(buildCleanProductRedirectUrl(aliasTarget, { ...query }));
  }

  notFound();
}
