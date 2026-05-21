import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GateValveSeoProductPage } from "@/components/catalog/GateValveSeoProductPage";
import { getPublicCatalogProducts } from "@/lib/public-catalog";
import { buildPublicProductView } from "@/lib/public-catalog/product-view";
import { toAbsoluteSiteUrl } from "@/lib/site-url";
import {
  findSeriesCatalogProduct,
  getRelatedSeriesSeoPages,
  getSeriesPagePath,
  getSeriesSeoPageByPath,
  PRODUCT_SERIES_SEO_PAGES,
} from "@/lib/seo-product-pages/product-series";

export const revalidate = 300;

type PageProps = {
  params: Promise<{ landingSlug: string }>;
};

export function generateStaticParams() {
  return PRODUCT_SERIES_SEO_PAGES.filter((page) => {
    const parts = getSeriesPagePath(page).split("/").filter(Boolean);
    return parts[0] === "klapany" && parts[1] === "obratnye" && parts.length === 3;
  }).map((page) => ({ landingSlug: page.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { landingSlug } = await params;
  const page = getSeriesSeoPageByPath(`/klapany/obratnye/${landingSlug}`);
  if (!page) return { title: "Страница не найдена" };

  const products = await getPublicCatalogProducts();
  const product = findSeriesCatalogProduct(products, page);
  const view = product ? buildPublicProductView(product) : null;
  const canonical = view?.canonicalUrl ?? toAbsoluteSiteUrl(getSeriesPagePath(page));
  const title = view?.seoTitle ?? page.seoTitle;
  const description = view?.seoDescription ?? page.seoDescription;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      locale: "ru_KZ",
      type: "website",
      images: view ? [{ url: view.primaryImageUrl, alt: view.primaryImageAlt }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: view ? [view.primaryImageUrl] : undefined,
    },
  };
}

export default async function CheckValveSeriesPage({ params }: PageProps) {
  const { landingSlug } = await params;
  const page = getSeriesSeoPageByPath(`/klapany/obratnye/${landingSlug}`);
  if (!page) notFound();

  const products = await getPublicCatalogProducts();
  const product = findSeriesCatalogProduct(products, page);
  const relatedPages = getRelatedSeriesSeoPages(page);

  return (
    <GateValveSeoProductPage
      page={page}
      product={product}
      relatedPages={relatedPages}
    />
  );
}

