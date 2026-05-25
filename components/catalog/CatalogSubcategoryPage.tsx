import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import {
  countPublicProductsBySubcategory,
  getPublicCatalogCategories,
  getPublicProductsBySubcategory,
  getPublicSubcategoryBySlug,
  type PublicCatalogCategory as Category,
  type PublicCatalogSubcategory as Subcategory,
} from "@/lib/public-catalog";
import { CatalogShell, type CatalogSearchParams } from "@/components/catalog/CatalogShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { COMPANY } from "@/lib/company";
import {
  buildCollectionPageJsonLd,
  buildSubcategoryBreadcrumbJsonLd,
} from "@/lib/structured-data";
import { resolveSubcategorySeoMetaDescription } from "@/lib/services/category-public-content";
import { catalogCategoryPath, catalogSubcategoryPath } from "@/lib/catalog-routes";
import { getKlapanySubcategorySeoTitle } from "@/lib/catalog-klapany-public-seo";

type SubcategoryContext = {
  category: Category;
  subcategory: Subcategory;
};

async function getSubcategoryContext(
  categorySlug: string,
  subcategorySlug: string,
): Promise<SubcategoryContext | undefined> {
  const ctx = await getPublicSubcategoryBySlug(subcategorySlug);
  if (!ctx || ctx.category.slug !== categorySlug) return undefined;
  return ctx;
}

function buildSubcategoryDescription(
  category: Category,
  subcategory: Subcategory,
  productCount: number,
): string {
  return `${subcategory.name} в категории «${category.name}» — ${productCount} позиций. Промышленная арматура в Казахстане: DN, PN, материал, КП, доставка по РК. Фильтрация в каталоге.`;
}

async function resolveSubcategoryDescription(
  category: Category,
  subcategory: Subcategory,
  productCount: number,
): Promise<string> {
  const manualDescription = await resolveSubcategorySeoMetaDescription(subcategory.slug);
  return (
    manualDescription?.trim() ||
    buildSubcategoryDescription(category, subcategory, productCount)
  );
}

export async function getCatalogSubcategoryMetadata(
  categorySlug: string,
  subcategorySlug: string,
): Promise<Metadata> {
  const context = await getSubcategoryContext(categorySlug, subcategorySlug);

  if (!context) return { title: "Подкатегория не найдена" };

  const productCount = await countPublicProductsBySubcategory(context.subcategory.id);
  const description = await resolveSubcategoryDescription(
    context.category,
    context.subcategory,
    productCount,
  );
  const canonicalPath = catalogSubcategoryPath(context.category.slug, context.subcategory.slug);
  const klapanyTitle =
    context.category.slug === "klapany"
      ? getKlapanySubcategorySeoTitle(context.subcategory.slug)
      : undefined;
  const pageTitle =
    klapanyTitle ?? `${context.subcategory.name} — ${context.category.name} · Казахстан`;

  return {
    title: pageTitle,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: `${pageTitle} | ${COMPANY.name}`,
      description,
      url: canonicalPath,
      siteName: COMPANY.name,
      locale: "ru_KZ",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${pageTitle} | ${COMPANY.name}`,
      description,
    },
  };
}

interface CatalogSubcategoryPageProps {
  categorySlug: string;
  subcategorySlug: string;
  searchParams: Promise<CatalogSearchParams>;
}

export async function CatalogSubcategoryPage({
  categorySlug,
  subcategorySlug,
  searchParams,
}: CatalogSubcategoryPageProps) {
  const context = await getSubcategoryContext(categorySlug, subcategorySlug);
  if (!context) notFound();

  const resolvedSearch = await searchParams;
  const [allCategories, subcategoryProducts] = await Promise.all([
    getPublicCatalogCategories(),
    getPublicProductsBySubcategory(context.subcategory.id),
  ]);
  const description = await resolveSubcategoryDescription(
    context.category,
    context.subcategory,
    subcategoryProducts.length,
  );
  const breadcrumbJsonLd = buildSubcategoryBreadcrumbJsonLd(
    context.category,
    context.subcategory,
  );
  const collectionPageJsonLd = buildCollectionPageJsonLd({
    name: context.subcategory.name,
    description,
    path: catalogSubcategoryPath(context.category.slug, context.subcategory.slug),
  });

  return (
    <div className="min-h-screen bg-site-bg">
      <JsonLd id={`breadcrumbs-subcategory-${context.subcategory.slug}`} data={breadcrumbJsonLd} />
      <JsonLd id={`collection-page-subcategory-${context.subcategory.slug}`} data={collectionPageJsonLd} />

      <div className="border-b border-site-border bg-site-card">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <nav aria-label="Хлебные крошки" className="mb-4">
            <ol className="flex items-center gap-1.5 text-sm">
              <li>
                <Link href="/" className="text-slate-500 hover:text-slate-900 transition-colors">
                  Главная
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight size={14} className="text-slate-400" />
              </li>
              <li>
                <Link
                  href="/catalog"
                  className="text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Каталог
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight size={14} className="text-slate-400" />
              </li>
              <li>
                <Link
                  href={catalogCategoryPath(context.category.slug)}
                  className="text-slate-500 hover:text-slate-900 transition-colors"
                >
                  {context.category.name}
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight size={14} className="text-slate-400" />
              </li>
              <li>
                <span className="font-medium text-slate-900" aria-current="page">
                  {context.subcategory.name}
                </span>
              </li>
            </ol>
          </nav>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {context.subcategory.name}
            <span className="mt-1 block text-xl font-semibold text-slate-500 sm:mt-2 sm:text-2xl">
              {context.category.name} · Казахстан
            </span>
          </h1>
          <p className="mt-2 max-w-3xl text-lg leading-relaxed text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <CatalogShell
          products={subcategoryProducts}
          categories={allCategories}
          searchParams={resolvedSearch}
          lockedCategoryId={context.category.id}
          lockedSubcategoryId={context.subcategory.id}
        />
      </div>
    </div>
  );
}
