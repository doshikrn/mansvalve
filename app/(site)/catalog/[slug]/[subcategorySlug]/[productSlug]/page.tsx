import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";

import { GateValveSeoProductPage } from "@/components/catalog/GateValveSeoProductPage";
import { getPublicProductBySlug } from "@/lib/public-catalog";
import { buildPublicProductView } from "@/lib/public-catalog/product-view";
import { toAbsoluteSiteUrl } from "@/lib/site-url";
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
    permanentRedirect(`${view.canonicalPath}${buildQueryString(query)}`);
  }

  const seriesPage = getSeriesSeoPageForProduct(product);
  if (!seriesPage) {
    notFound();
  }

  const relatedPages = getRelatedSeriesSeoPages(seriesPage);

  return <GateValveSeoProductPage page={seriesPage} product={product} relatedPages={relatedPages} />;
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
