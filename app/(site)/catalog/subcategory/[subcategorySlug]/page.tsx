import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import {
  getPublicCatalogCategories,
  getPublicCatalogProducts,
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

interface PageProps {
  params: Promise<{ subcategorySlug: string }>;
  searchParams: Promise<CatalogSearchParams>;
}

type SubcategoryContext = {
  category: Category;
  subcategory: Subcategory;
};

async function getSubcategoryContext(
  subcategorySlug: string,
): Promise<SubcategoryContext | undefined> {
  return getPublicSubcategoryBySlug(subcategorySlug);
}

function buildSubcategoryDescription(
  category: Category,
  subcategory: Subcategory,
  productCount: number,
): string {
  return `${subcategory.name} (${category.name}) — ${productCount} позиций в наличии и под заказ. Фильтрация по DN, PN, резьбе, материалу, типу соединения и типу управления.`;
}

export async function generateStaticParams() {
  const categories = await getPublicCatalogCategories();
  return categories.flatMap((category) =>
    category.subcategories.map((subcategory) => ({
      subcategorySlug: subcategory.slug,
    })),
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { subcategorySlug } = await params;
  const context = await getSubcategoryContext(subcategorySlug);

  if (!context) return { title: "Подкатегория не найдена" };

  const productCount = (await getPublicProductsBySubcategory(context.subcategory.id))
    .length;
  const customMeta = await resolveSubcategorySeoMetaDescription(subcategorySlug);
  const description =
    customMeta?.trim() ||
    buildSubcategoryDescription(context.category, context.subcategory, productCount);
  const canonicalPath = `/catalog/subcategory/${context.subcategory.slug}`;

  return {
    title: `${context.subcategory.name} — купить в Казахстане`,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: `${context.subcategory.name} | ${COMPANY.name}`,
      description,
      url: canonicalPath,
      siteName: COMPANY.name,
      locale: "ru_KZ",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${context.subcategory.name} | ${COMPANY.name}`,
      description,
    },
  };
}

export default async function SubcategoryPage({ params, searchParams }: PageProps) {
  const { subcategorySlug } = await params;
  const context = await getSubcategoryContext(subcategorySlug);
  if (!context) notFound();

  const resolvedSearch = await searchParams;
  const [allProducts, allCategories, subcategoryProducts] = await Promise.all([
    getPublicCatalogProducts(),
    getPublicCatalogCategories(),
    getPublicProductsBySubcategory(context.subcategory.id),
  ]);
  const description = buildSubcategoryDescription(
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
    path: `/catalog/subcategory/${context.subcategory.slug}`,
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <JsonLd id={`breadcrumbs-subcategory-${context.subcategory.slug}`} data={breadcrumbJsonLd} />
      <JsonLd id={`collection-page-subcategory-${context.subcategory.slug}`} data={collectionPageJsonLd} />

      <div className="border-b border-slate-200 bg-white">
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
                  href={`/catalog/category/${context.category.slug}`}
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
          </h1>
          <p className="mt-2 text-lg text-slate-500">
            {subcategoryProducts.length} позиций · раздел «{context.category.name}»
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <CatalogShell
          products={allProducts}
          categories={allCategories}
          searchParams={resolvedSearch}
          lockedCategoryId={context.category.id}
          lockedSubcategoryId={context.subcategory.id}
        />
      </div>
    </div>
  );
}
