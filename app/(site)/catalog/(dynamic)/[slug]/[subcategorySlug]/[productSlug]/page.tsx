import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";

import { CatalogProductTovarView } from "@/components/catalog/CatalogProductTovarView";
import { GateValveSeoProductPage } from "@/components/catalog/GateValveSeoProductPage";
import { prepareTovarProductPageData } from "@/components/catalog/tovar-product-presentation";
import {
  getPublicCatalogCategories,
  getPublicCatalogListingProducts,
  getPublicProductBySlug,
} from "@/lib/public-catalog";
import { buildPublicProductView } from "@/lib/public-catalog/product-view";
import { COMPANY_BRAND_SEO } from "@/lib/company";
import { toAbsoluteSiteUrl } from "@/lib/site-url";
import { buildCleanProductRedirectUrl } from "@/lib/catalog-redirect";
import {
  getRelatedSeriesSeoPages,
  getSeriesSeoPageForProduct,
} from "@/lib/seo-product-pages/product-series";

export const revalidate = 300;
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ slug: string; subcategorySlug: string; productSlug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, subcategorySlug, productSlug } = await params;
  const product = await getPublicProductBySlug(productSlug);
  if (!product) return { title: "Товар не найден" };

  const view = buildPublicProductView(product);
  const expectedPath = `/catalog/${slug}/${subcategorySlug}/${productSlug}`;
  if (view.canonicalPath !== expectedPath) {
    return {
      title: "Перенаправление…",
      alternates: { canonical: toAbsoluteSiteUrl(view.canonicalPath) },
    };
  }

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

export default async function CatalogNestedProductPage({ params, searchParams }: PageProps) {
  const { slug, subcategorySlug, productSlug } = await params;
  const query = searchParams ? await searchParams : {};

  const product = await getPublicProductBySlug(productSlug);
  if (!product) notFound();

  const view = buildPublicProductView(product);
  const expectedPath = `/catalog/${slug}/${subcategorySlug}/${productSlug}`;
  if (view.canonicalPath !== expectedPath) {
    permanentRedirect(buildCleanProductRedirectUrl(view.canonicalPath, query));
  }

  const seriesPage = getSeriesSeoPageForProduct(product);
  if (seriesPage) {
    const relatedPages = getRelatedSeriesSeoPages(seriesPage);
    return (
      <GateValveSeoProductPage page={seriesPage} product={product} relatedPages={relatedPages} />
    );
  }

  if (
    slug === "klapany" &&
    product.category === "klapany" &&
    product.subcategory === subcategorySlug
  ) {
    const [categories, allProducts] = await Promise.all([
      getPublicCatalogCategories(),
      getPublicCatalogListingProducts(),
    ]);
    const data = await prepareTovarProductPageData(product, categories, allProducts);
    return <CatalogProductTovarView {...data} />;
  }

  notFound();
}
