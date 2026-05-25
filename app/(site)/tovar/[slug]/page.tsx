import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";

import { CatalogProductTovarView } from "@/components/catalog/CatalogProductTovarView";
import { prepareTovarProductPageData } from "@/components/catalog/tovar-product-presentation";
import {
  getPublicCatalogCategories,
  getPublicCatalogListingProducts,
  getPublicProductBySlug,
} from "@/lib/public-catalog";
import { buildPublicProductView } from "@/lib/public-catalog/product-view";
import { COMPANY_BRAND_SEO } from "@/lib/company";
import { buildCleanProductRedirectUrl } from "@/lib/catalog-redirect";
import { resolveProductSlugAliasTarget } from "@/lib/public-catalog/slug-aliases";

export const revalidate = 300;

/** Products whose canonical is not `/tovar/[slug]` are redirected; keep dynamicParams for those. */
export const dynamicParams = true;

const tovarPathForSlug = (slug: string) => `/tovar/${slug}`;

export async function generateStaticParams() {
  const products = await getPublicCatalogListingProducts();
  return products
    .filter((p) => buildPublicProductView(p).canonicalPath === tovarPathForSlug(p.slug))
    .map((p) => ({ slug: p.slug }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublicProductBySlug(slug);

  if (!product) {
    const aliasTarget = await resolveProductSlugAliasTarget(slug);
    if (aliasTarget) {
      return { title: "Перенаправление…", alternates: { canonical: aliasTarget } };
    }
    return { title: "Товар не найден" };
  }

  const view = buildPublicProductView(product);

  return {
    title: view.seoTitle,
    description: view.seoDescription,
    alternates: {
      canonical: view.canonicalUrl,
    },
    openGraph: {
      title: view.seoTitle,
      description: view.seoDescription,
      type: "website",
      url: view.canonicalUrl,
      siteName: COMPANY_BRAND_SEO,
      locale: "ru_KZ",
      images: [{ url: view.primaryImageUrl, alt: view.primaryImageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: view.seoTitle,
      description: view.seoDescription,
      images: [view.primaryImageUrl],
    },
  };
}

export default async function ProductPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const query = searchParams ? await searchParams : {};

  const [product, categories, allProducts] = await Promise.all([
    getPublicProductBySlug(slug),
    getPublicCatalogCategories(),
    getPublicCatalogListingProducts(),
  ]);

  if (!product) {
    const aliasTarget = await resolveProductSlugAliasTarget(slug);
    if (aliasTarget) {
      permanentRedirect(buildCleanProductRedirectUrl(aliasTarget, query));
    }
    notFound();
  }

  const view = buildPublicProductView(product);
  if (view.canonicalPath !== tovarPathForSlug(product.slug)) {
    permanentRedirect(buildCleanProductRedirectUrl(view.canonicalPath, query));
  }

  const data = await prepareTovarProductPageData(product, categories, allProducts);
  return <CatalogProductTovarView {...data} />;
}
