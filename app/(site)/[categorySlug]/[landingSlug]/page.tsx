import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { CatalogShell, type CatalogSearchParams } from "@/components/catalog/CatalogShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { CATALOG_LANDING_PAGES, getLandingPage } from "@/lib/catalog-seo";
import {
  getPublicCatalogCategories,
  getPublicCatalogProducts,
  getPublicCategoryById,
} from "@/lib/public-catalog";
import {
  buildCategoryBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
} from "@/lib/structured-data";

interface PageProps {
  params: Promise<{ categorySlug: string; landingSlug: string }>;
}

export function generateStaticParams() {
  return CATALOG_LANDING_PAGES.map((page) => ({
    categorySlug: page.categorySlug,
    landingSlug: page.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categorySlug, landingSlug } = await params;
  const landing = getLandingPage(categorySlug, landingSlug);

  if (!landing) {
    return {
      title: "Страница не найдена",
    };
  }

  const canonical = `/${landing.categorySlug}/${landing.slug}`;

  return {
    title: landing.title,
    description: landing.description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: landing.title,
      description: landing.description,
      url: canonical,
      locale: "ru_KZ",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: landing.title,
      description: landing.description,
    },
  };
}

export default async function CatalogLandingPage({ params }: PageProps) {
  const { categorySlug, landingSlug } = await params;
  const landing = getLandingPage(categorySlug, landingSlug);

  if (!landing) notFound();

  const [products, categories, category] = await Promise.all([
    getPublicCatalogProducts(),
    getPublicCatalogCategories(),
    getPublicCategoryById(landing.filters.categoryId),
  ]);

  if (!category) notFound();

  const searchParams = buildLandingSearchParams(landing);
  const canonical = `/${landing.categorySlug}/${landing.slug}`;
  const collectionPageJsonLd = buildCollectionPageJsonLd({
    name: landing.h1,
    description: landing.description,
    path: canonical,
  });
  const breadcrumbJsonLd = buildCategoryBreadcrumbJsonLd(category);

  return (
    <div className="min-h-screen bg-site-bg">
      <JsonLd id={`breadcrumbs-${landing.categorySlug}-${landing.slug}`} data={breadcrumbJsonLd} />
      <JsonLd id={`collection-${landing.categorySlug}-${landing.slug}`} data={collectionPageJsonLd} />

      <div className="border-b border-site-border bg-site-card">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <nav aria-label="Хлебные крошки" className="mb-4">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm">
              <li>
                <Link href="/" className="text-slate-500 transition-colors hover:text-slate-900">
                  Главная
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight size={14} className="text-slate-400" />
              </li>
              <li>
                <Link
                  href="/catalog"
                  className="text-slate-500 transition-colors hover:text-slate-900"
                >
                  Каталог
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight size={14} className="text-slate-400" />
              </li>
              <li>
                <Link
                  href={`/catalog/category/${category.slug}`}
                  className="text-slate-500 transition-colors hover:text-slate-900"
                >
                  {category.name}
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight size={14} className="text-slate-400" />
              </li>
              <li>
                <span className="font-medium text-slate-900" aria-current="page">
                  {landing.h1}
                </span>
              </li>
            </ol>
          </nav>

          <h1 className="max-w-4xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {landing.h1}
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
            {landing.description}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <CatalogShell
          products={products}
          categories={categories}
          searchParams={searchParams}
          lockedCategoryId={landing.filters.categoryId}
          lockedSubcategoryId={landing.filters.subcategoryId}
        />
      </div>
    </div>
  );
}

function buildLandingSearchParams(landing: {
  filters: {
    model?: string;
    pn?: number;
    material?: string;
    connectionType?: string;
    controlType?: string;
    q?: string;
  };
}): CatalogSearchParams {
  return {
    model: landing.filters.model,
    pn: landing.filters.pn != null ? String(landing.filters.pn) : undefined,
    material: landing.filters.material,
    connectionType: landing.filters.connectionType,
    controlType: landing.filters.controlType,
    q: landing.filters.q,
  };
}
