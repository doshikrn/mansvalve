import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";

import {
  getPublicCatalogProducts,
  getPublicCatalogCategories,
  getPublicCategoryBySlug,
  getPublicProductBySlug,
  getPublicSubcategoryBySlug,
  type PublicCatalogCategory,
} from "@/lib/public-catalog";
import { buildPublicProductView } from "@/lib/public-catalog/product-view";
import {
  buildCatalogListingRedirectUrl,
  buildCleanProductRedirectUrl,
  type SearchParamsLike,
} from "@/lib/catalog-redirect";
import { redirectLegacyCatalogProductIfNeeded } from "@/lib/catalog-legacy-product-redirect";
import {
  CatalogCategoryPage,
  getCatalogCategoryMetadata,
} from "@/components/catalog/CatalogCategoryPage";
import {
  CatalogSubcategoryPage,
  getCatalogSubcategoryMetadata,
} from "@/components/catalog/CatalogSubcategoryPage";
import { CatalogRouteError } from "@/components/catalog/CatalogRouteError";
import type { CatalogSearchParams } from "@/components/catalog/CatalogShell";
import { withCatalogRouteLoad } from "@/lib/catalog/runtime";
import {
  catalogCategoryPath,
  catalogSubcategoryListingHref,
  resolveCatalogSubcategoryRouteSlug,
} from "@/lib/catalog-routes";

export const revalidate = 300;

/**
 * Pre-render category listings only. Legacy product slugs under `/catalog/[slug]`
 * must stay dynamic so `permanentRedirect` returns a real HTTP 308 at request time
 * (SSG product entries were served as 200 + "Перенаправление…" HTML).
 */
export async function generateStaticParams() {
  const [products, categories] = await Promise.all([
    getPublicCatalogProducts(),
    getPublicCatalogCategories(),
  ]);
  const productSlugSet = new Set(products.map((p) => p.slug));
  return categories
    .filter((c) => !productSlugSet.has(c.slug))
    .map((c) => ({ slug: c.slug }));
}

export const dynamicParams = true;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<CatalogSearchParams>;
}

function getSingleSearchParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function stripSubcategorySelectionParams(searchParams: SearchParamsLike): SearchParamsLike {
  const rest: SearchParamsLike = { ...searchParams };
  delete rest.category;
  delete rest.subcategory;
  return rest;
}

function buildSubcategoryQueryRedirect(
  category: PublicCatalogCategory,
  searchParams: SearchParamsLike,
): string | undefined {
  const rawSubcategorySlug = getSingleSearchParam(searchParams.subcategory)?.trim();
  if (!rawSubcategorySlug) return undefined;

  const routeSubcategorySlug = resolveCatalogSubcategoryRouteSlug(rawSubcategorySlug);
  const subcategory = category.subcategories.find(
    (sub) => sub.slug === routeSubcategorySlug || sub.id === routeSubcategorySlug,
  );
  if (!subcategory) return undefined;

  const listingHref = catalogSubcategoryListingHref(category.slug, subcategory.slug);
  // Filter-style listing (`?subcategory=`) is self-canonical on the category page.
  if (listingHref.startsWith(`${catalogCategoryPath(category.slug)}?`)) {
    return undefined;
  }

  return buildCatalogListingRedirectUrl(
    listingHref,
    stripSubcategorySelectionParams(searchParams),
  );
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const query = await searchParams;

  let product: Awaited<ReturnType<typeof getPublicProductBySlug>>;
  try {
    product = await getPublicProductBySlug(slug);
  } catch (error) {
    console.error("[catalog-slug] metadata product load failed", { slug, error });
    return { title: "Каталог MANSVALVE GROUP" };
  }
  if (product) {
    const view = buildPublicProductView(product);
    permanentRedirect(buildCleanProductRedirectUrl(view.canonicalPath));
  }

  let category: Awaited<ReturnType<typeof getPublicCategoryBySlug>>;
  try {
    category = await getPublicCategoryBySlug(slug);
  } catch (error) {
    console.error("[catalog-slug] metadata category load failed", { slug, error });
    return { title: "Каталог MANSVALVE GROUP" };
  }
  if (category) {
    const subcategoryRedirect = buildSubcategoryQueryRedirect(category, query as SearchParamsLike);
    if (subcategoryRedirect) permanentRedirect(subcategoryRedirect);
    return getCatalogCategoryMetadata(slug, query);
  }

  const routeSubcategorySlug = resolveCatalogSubcategoryRouteSlug(slug);
  let subcategoryContext: Awaited<ReturnType<typeof getPublicSubcategoryBySlug>>;
  try {
    subcategoryContext = await getPublicSubcategoryBySlug(routeSubcategorySlug);
  } catch (error) {
    console.error("[catalog-slug] metadata subcategory load failed", { slug, error });
    return { title: "Каталог MANSVALVE GROUP" };
  }
  if (subcategoryContext) {
    return getCatalogSubcategoryMetadata(
      subcategoryContext.category.slug,
      subcategoryContext.subcategory.slug,
      query,
    );
  }

  await redirectLegacyCatalogProductIfNeeded(slug);

  return { title: "Страница не найдена" };
}

/**
 * `/catalog/[slug]` обслуживает:
 * - legacy URL товара → 308 на канонический URL (`/tovar/...` или SEO-лендинг);
 * - категорию → страница `/catalog/[categorySlug]` (канонический листинг).
 */
export default async function CatalogSlugPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const query = await searchParams;

  await redirectLegacyCatalogProductIfNeeded(slug, { ...query });

  const route = `/catalog/${slug}`;
  const loaded = await withCatalogRouteLoad(
    { route, categorySlug: slug },
    () => getPublicCategoryBySlug(slug),
    (category) => ({ categoriesCount: category ? 1 : 0 }),
  );

  if (!loaded.ok) {
    return <CatalogRouteError route={route} />;
  }

  const category = loaded.data;
  if (category) {
    const subcategoryRedirect = buildSubcategoryQueryRedirect(
      category,
      query as SearchParamsLike,
    );
    if (subcategoryRedirect) permanentRedirect(subcategoryRedirect);

    return <CatalogCategoryPage categorySlug={slug} searchParams={searchParams} />;
  }

  const routeSubcategorySlug = resolveCatalogSubcategoryRouteSlug(slug);
  const subcategoryLoaded = await withCatalogRouteLoad(
    { route, subcategorySlug: routeSubcategorySlug },
    () => getPublicSubcategoryBySlug(routeSubcategorySlug),
    (context) => ({ categoriesCount: context ? 1 : 0 }),
  );

  if (!subcategoryLoaded.ok) {
    return <CatalogRouteError route={route} />;
  }

  if (subcategoryLoaded.data) {
    const listingHref = catalogSubcategoryListingHref(
      subcategoryLoaded.data.category.slug,
      subcategoryLoaded.data.subcategory.slug,
    );

    if (listingHref !== route) {
      permanentRedirect(buildCatalogListingRedirectUrl(listingHref, query as SearchParamsLike));
    }

    return (
      <CatalogSubcategoryPage
        categorySlug={subcategoryLoaded.data.category.slug}
        subcategorySlug={subcategoryLoaded.data.subcategory.slug}
        searchParams={searchParams}
        currentPath={route}
      />
    );
  }

  notFound();
}
