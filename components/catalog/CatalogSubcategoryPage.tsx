import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import {
  getPublicCatalogCategories,
  getPublicProductsBySubcategory,
  getPublicSubcategoryBySlug,
  type PublicCatalogCategory as Category,
  type PublicCatalogProduct as Product,
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

/**
 * Точечная канонизация дублей: подкатегория с тем же H1/intent, что и более
 * полный коммерческий SEO-landing, канонизируется на landing. Ключ —
 * `${categorySlug}/${subcategorySlug}`. Остальные подкатегории остаются self-canonical.
 */
const SUBCATEGORY_CANONICAL_OVERRIDES: Record<string, string> = {
  "zadvizhki/zadvizhki-s-elektroprivodom": "/zadvizhki/s-elektroprivodom",
};

async function getSubcategoryContext(
  categorySlug: string,
  subcategorySlug: string,
): Promise<SubcategoryContext | undefined> {
  const ctx = await getPublicSubcategoryBySlug(subcategorySlug);
  if (!ctx || ctx.category.slug !== categorySlug) return undefined;
  return ctx;
}

/** Уникальные непустые значения, отбрасывая плейсхолдеры вида «Не указан(о)». */
function uniqueMeaningful(values: Array<string | undefined>): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of values) {
    const value = raw?.trim();
    if (!value || /^не\s+указан/iu.test(value)) continue;
    if (seen.has(value)) continue;
    seen.add(value);
    result.push(value);
  }
  return result;
}

/** Короткая сводка фактов из товаров подкатегории: DN-диапазон, до 2 PN, до 2 материалов, 1 модель. */
function buildSubcategoryFacetSummary(products: Product[]): string {
  const parts: string[] = [];

  const dns = products.map((p) => p.dn).filter((v): v is number => typeof v === "number");
  if (dns.length > 0) {
    const min = Math.min(...dns);
    const max = Math.max(...dns);
    parts.push(min === max ? `DN${min}` : `DN${min}–${max}`);
  }

  const pns = [
    ...new Set(products.map((p) => p.pn).filter((v): v is number => typeof v === "number")),
  ].sort((a, b) => a - b);
  if (pns.length > 0) {
    parts.push(`PN${pns.slice(0, 2).join("/")}`);
  }

  const materials = uniqueMeaningful(products.map((p) => p.material)).slice(0, 2);
  if (materials.length > 0) {
    parts.push(materials.join(", "));
  }

  const model = uniqueMeaningful(products.map((p) => p.model))[0];
  if (model) {
    parts.push(model);
  }

  return parts.join(", ");
}

function buildSubcategoryDescription(
  category: Category,
  subcategory: Subcategory,
  products: Product[],
): string {
  const facets = buildSubcategoryFacetSummary(products);
  const facetPart = facets ? ` ${facets}.` : "";
  return `${subcategory.name} (${category.name}): ${products.length} поз.${facetPart} КП и доставка по РК.`;
}

async function resolveSubcategoryDescription(
  category: Category,
  subcategory: Subcategory,
  products: Product[],
): Promise<string> {
  const manualDescription = await resolveSubcategorySeoMetaDescription(subcategory.slug);
  return (
    manualDescription?.trim() ||
    buildSubcategoryDescription(category, subcategory, products)
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
  const subcategoryProducts = await getPublicProductsBySubcategory(context.subcategory.id);
  const description = await resolveSubcategoryDescription(
    context.category,
    context.subcategory,
    subcategoryProducts,
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
  const canonicalForPage =
    SUBCATEGORY_CANONICAL_OVERRIDES[`${context.category.slug}/${context.subcategory.slug}`] ??
    meta.canonicalPath;

  return {
    title: meta.title,
    description: meta.description,
    robots: meta.robots,
    alternates: {
      canonical: canonicalForPage,
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: canonicalForPage,
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
    subcategoryProducts,
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
