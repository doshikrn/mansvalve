import type { Metadata } from "next";
import Link from "next/link";
import {
  ChevronRight,
  FileCheck2,
  ShieldCheck,
  Timer,
  Truck,
} from "lucide-react";

import { CatalogShell, type CatalogSearchParams } from "@/components/catalog/CatalogShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { COMPANY_BRAND_SEO } from "@/lib/company";
import { buildCollectionPageJsonLd } from "@/lib/structured-data";
import { CatalogRouteError } from "@/components/catalog/CatalogRouteError";
import { withCatalogRouteLoad } from "@/lib/catalog/runtime";
import {
  getPublicCatalogCategories,
  getPublicCatalogListingProducts,
} from "@/lib/public-catalog";
import { getOrderedCatalogCategories } from "@/lib/catalog-seo";
import { appendPageNumberSuffix, buildPagedMeta } from "@/lib/seo/metadata";

export const revalidate = 300;

/* ── SEO ──────────────────────────────────────────────────────────── */

const CATALOG_TITLE = "Каталог промышленной арматуры";
const CATALOG_DESCRIPTION =
  "Задвижки, затворы дисковые, краны шаровые, клапаны обратные, компенсаторы, фланцы и электроприводы. Подбор по типу товара, DN, PN, марке и материалу.";

const CATALOG_TRUST_PILLS = [
  { label: "ГОСТ / DIN / ISO", Icon: ShieldCheck },
  { label: "КП за 15 минут", Icon: Timer },
  { label: "Доставка по РК", Icon: Truck },
  { label: "Документы и НДС", Icon: FileCheck2 },
] as const;

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const query = await searchParams;
  const meta = buildPagedMeta({
    title: CATALOG_TITLE,
    description: CATALOG_DESCRIPTION,
    canonicalPath: "/catalog",
    searchParams: query,
  });

  return {
    title: meta.metadataTitle,
    description: meta.description,
    robots: meta.robots,
    alternates: {
      canonical: meta.canonicalPath,
    },
    openGraph: {
      title: meta.socialTitle,
      description: meta.description,
      url: meta.canonicalPath,
      siteName: COMPANY_BRAND_SEO,
      locale: "ru_KZ",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: meta.socialTitle,
      description: meta.description,
    },
  };
}

/* ── Page ─────────────────────────────────────────────────────────── */

interface PageProps {
  searchParams: Promise<CatalogSearchParams>;
}

export default async function CatalogPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const pageMeta = buildPagedMeta({
    title: CATALOG_TITLE,
    description: CATALOG_DESCRIPTION,
    canonicalPath: "/catalog",
    searchParams: params,
  });
  const pageHeading = appendPageNumberSuffix(CATALOG_TITLE, pageMeta.pageNumber);
  const loaded = await withCatalogRouteLoad(
    { route: "/catalog" },
    async () => {
      const [products, categories] = await Promise.all([
        getPublicCatalogListingProducts(),
        getPublicCatalogCategories(),
      ]);
      return { products, categories };
    },
    (data) => ({
      productsCount: data.products.length,
      categoriesCount: data.categories.length,
    }),
  );

  if (!loaded.ok) {
    return <CatalogRouteError route="/catalog" />;
  }

  const { products, categories } = loaded.data;
  const orderedCategories = getOrderedCatalogCategories(categories);
  const collectionPageJsonLd = buildCollectionPageJsonLd({
    name: pageHeading,
    description: pageMeta.description,
    path: pageMeta.canonicalPath,
  });

  return (
    <div className="min-h-screen bg-site-bg">
      <JsonLd id="collection-page-catalog" data={collectionPageJsonLd} />

      {/* Compact catalog heading: the product workflow starts in the first viewport. */}
      <section
        className="border-b border-site-border bg-white"
        aria-labelledby="catalog-page-heading"
      >
        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-8">
          <nav aria-label="Хлебные крошки" className="mb-4">
            <ol className="flex items-center gap-1.5 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-slate-500 transition-colors hover:text-site-ink"
                >
                  Главная
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight size={14} className="text-slate-400" />
              </li>
              <li>
                <span className="font-semibold text-site-ink" aria-current="page">
                  Каталог
                </span>
              </li>
            </ol>
          </nav>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <h1 id="catalog-page-heading" className="text-3xl font-bold leading-tight text-site-ink sm:text-4xl">
                {pageHeading}
              </h1>
              {!pageMeta.pageNumber ? (
                <p className="mt-2 text-sm leading-relaxed text-site-muted sm:text-base">
                  {CATALOG_DESCRIPTION}
                </p>
              ) : null}
            </div>

            <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
              <div className="flex items-baseline gap-1.5">
                <dt className="sr-only">Позиций</dt>
                <dd className="text-lg font-bold tabular-nums text-site-ink">{products.length}</dd>
                <span>позиций</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <dt className="sr-only">Категорий</dt>
                <dd className="text-lg font-bold tabular-nums text-site-ink">{orderedCategories.length}</dd>
                <span>категорий</span>
              </div>
            </dl>
          </div>

          <ul className="mt-5 flex flex-wrap gap-2">
            {CATALOG_TRUST_PILLS.map(({ label, Icon }) => (
              <li
                key={label}
                className="inline-flex items-center gap-1.5 rounded-md border border-site-border bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700"
              >
                <Icon className="h-3.5 w-3.5 shrink-0 text-site-primary" strokeWidth={2} aria-hidden />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Filters + grid */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
        <CatalogShell
          products={products}
          categories={orderedCategories}
          searchParams={params}
        />
      </div>
    </div>
  );
}
