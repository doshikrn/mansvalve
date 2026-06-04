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
import { CatalogRouteError } from "@/components/catalog/CatalogRouteError";
import { CatalogShellSuspense } from "@/components/catalog/CatalogShellSuspense";
import type { CatalogSearchParams } from "@/components/catalog/CatalogShell";
import { withCatalogRouteLoad } from "@/lib/catalog/runtime";
import { JsonLd } from "@/components/seo/JsonLd";
import { COMPANY } from "@/lib/company";
import {
  buildCollectionPageJsonLd,
  buildSubcategoryBreadcrumbJsonLd,
} from "@/lib/structured-data";
import { resolveSubcategorySeoMetaDescription } from "@/lib/services/category-public-content";
import { catalogCategoryPath, catalogSubcategoryPath } from "@/lib/catalog-routes";
import { getKlapanySubcategorySeoTitle } from "@/lib/catalog-klapany-public-seo";
import { buildPagedMeta } from "@/lib/seo/metadata";

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
  return `${subcategory.name} в категории «${category.name}»: ${productCount} позиций. Подбор по DN/PN, материалу и типу соединения, КП и доставка по Казахстану.`;
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
  searchParams?: CatalogSearchParams,
): Promise<Metadata> {
  let context: SubcategoryContext | undefined;
  try {
    context = await getSubcategoryContext(categorySlug, subcategorySlug);
  } catch (error) {
    console.error("[catalog-subcategory] metadata load failed", {
      categorySlug,
      subcategorySlug,
      error,
    });
    return { title: "Каталог MANSVALVE GROUP" };
  }

  if (!context) return { title: "Подкатегория не найдена" };

  try {
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
  const meta = buildPagedMeta({
    title: pageTitle,
    description,
    canonicalPath,
    searchParams,
  });

  return {
    title: meta.title,
    description: meta.description,
    robots: meta.robots,
    alternates: {
      canonical: meta.canonicalPath,
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: meta.canonicalPath,
      siteName: COMPANY.name,
      locale: "ru_KZ",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
    },
  };
  } catch (error) {
    console.error("[catalog-subcategory] metadata resolve failed", {
      categorySlug,
      subcategorySlug,
      error,
    });
    return { title: context.subcategory.name };
  }
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
  const route = `/catalog/${categorySlug}/${subcategorySlug}`;
  const loaded = await withCatalogRouteLoad(
    { route, categorySlug, subcategorySlug },
    async () => {
      const context = await getSubcategoryContext(categorySlug, subcategorySlug);
      if (!context) return null;

      const [allCategories, subcategoryProducts] = await Promise.all([
        getPublicCatalogCategories(),
        getPublicProductsBySubcategory(context.subcategory.id),
      ]);

      return { context, allCategories, subcategoryProducts };
    },
    (data) =>
      data
        ? {
            productsCount: data.subcategoryProducts.length,
            categoriesCount: data.allCategories.length,
          }
        : {},
  );

  if (!loaded.ok) {
    return <CatalogRouteError route={route} />;
  }

  if (!loaded.data) {
    notFound();
  }

  const { context, allCategories, subcategoryProducts } = loaded.data;
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
        <CatalogShellSuspense
          products={subcategoryProducts}
          categories={allCategories}
          searchParams={searchParams}
          lockedCategoryId={context.category.id}
          lockedSubcategoryId={context.subcategory.id}
        />
      </div>
    </div>
  );
}
