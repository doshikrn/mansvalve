import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { CatalogShell, type CatalogSearchParams } from "@/components/catalog/CatalogShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { COMPANY_BRAND_SEO } from "@/lib/company";
import { buildCollectionPageJsonLd } from "@/lib/structured-data";
import {
  getPublicCatalogCategories,
  getPublicCatalogProducts,
} from "@/lib/public-catalog";
import { getOrderedCatalogCategories } from "@/lib/catalog-seo";

/* ── SEO ──────────────────────────────────────────────────────────── */

const CATALOG_TITLE = "Каталог промышленной арматуры";
const CATALOG_DESCRIPTION =
  "Задвижки, затворы дисковые, краны шаровые, клапаны обратные, компенсаторы, фланцы и электроприводы. Подбор по типу товара, DN, PN, марке и материалу.";

export const metadata: Metadata = {
  title: CATALOG_TITLE,
  description: CATALOG_DESCRIPTION,
  alternates: {
    canonical: "/catalog",
  },
  openGraph: {
    title: `${CATALOG_TITLE} | ${COMPANY_BRAND_SEO}`,
    description: CATALOG_DESCRIPTION,
    url: "/catalog",
    siteName: COMPANY_BRAND_SEO,
    locale: "ru_KZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${CATALOG_TITLE} | ${COMPANY_BRAND_SEO}`,
    description: CATALOG_DESCRIPTION,
  },
};

/* ── Page ─────────────────────────────────────────────────────────── */

interface PageProps {
  searchParams: Promise<CatalogSearchParams>;
}

export default async function CatalogPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const [products, categories] = await Promise.all([
    getPublicCatalogProducts(),
    getPublicCatalogCategories(),
  ]);
  const orderedCategories = getOrderedCatalogCategories(categories);
  const collectionPageJsonLd = buildCollectionPageJsonLd({
    name: CATALOG_TITLE,
    description: CATALOG_DESCRIPTION,
    path: "/catalog",
  });

  return (
    <div className="min-h-screen bg-site-bg">
      <JsonLd id="collection-page-catalog" data={collectionPageJsonLd} />
      {/* Page header */}
      <div className="border-b border-site-border bg-site-card">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          {/* Breadcrumbs */}
          <nav aria-label="Хлебные крошки" className="mb-4">
            <ol className="flex items-center gap-1.5 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Главная
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight size={14} className="text-slate-400" />
              </li>
              <li>
                <span className="font-medium text-slate-900" aria-current="page">
                  Каталог
                </span>
              </li>
            </ol>
          </nav>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {CATALOG_TITLE}
          </h1>
          <p className="mt-2 text-lg text-slate-500">
            {products.length} позиций · {orderedCategories.length} категорий · DN15-DN1000
          </p>
        </div>
      </div>

      {/* Filters + grid */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <CatalogShell
          products={products}
          categories={orderedCategories}
          searchParams={params}
        />
      </div>
    </div>
  );
}
