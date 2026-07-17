import { Suspense } from "react";

import { ProductGrid } from "@/components/catalog/ProductGrid";
import { Pagination } from "@/components/catalog/Pagination";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildCatalogItemListJsonLd } from "@/lib/structured-data";
import {
  getOrderedCatalogCategories,
} from "@/lib/catalog-seo";
import { runCatalogQuery } from "@/lib/catalog-query";
import { catalogCategoryPath, catalogSubcategoryPath } from "@/lib/catalog-routes";
import { getMetaPageNumber } from "@/lib/seo/metadata";
import type {
  PublicCatalogCategory,
  PublicCatalogProduct as Product,
} from "@/lib/public-catalog";

const PAGE_SIZE = 12;
const ITEM_LIST_MAX_ITEMS = 20;

export interface CatalogSearchParams {
  category?: string;
  subcategory?: string;
  dn?: string;
  pn?: string;
  model?: string;
  thread?: string;
  material?: string;
  connectionType?: string;
  connection?: string;
  controlType?: string;
  sort?: string;
  view?: string;
  page?: string;
  q?: string;
}

interface CatalogShellProps {
  products: Product[];
  categories: PublicCatalogCategory[];
  searchParams: CatalogSearchParams;
  /**
   * When provided, the shell is locked to this category:
   * – pre-filters the product pool before applying URL params
   * – hides the category tab row in CatalogFilters
   * – computes filter options (DN/PN/material) only from that category's products
   */
  lockedCategoryId?: string;
  /**
   * When provided, the shell is locked to this subcategory:
   * – pre-filters the product pool before applying URL params
   * – keeps pagination and filters URL-driven on the subcategory route
   */
  lockedSubcategoryId?: string;
}

type CatalogQuickLink = {
  href: string;
  label: string;
  count: number;
  active?: boolean;
};

export function CatalogShell({
  products,
  categories,
  searchParams,
  lockedCategoryId,
  lockedSubcategoryId,
}: CatalogShellProps) {
  const orderedCategories = getOrderedCatalogCategories(categories);
  const subcategoryById = new Map(
    orderedCategories.flatMap((category) =>
      category.subcategories.map((sub) => [sub.id, { ...sub, category }] as const),
    ),
  );

  const lockedSubcategory = lockedSubcategoryId
    ? subcategoryById.get(lockedSubcategoryId)
    : undefined;
  const effectiveLockedCategoryId = lockedCategoryId ?? lockedSubcategory?.parentCategory;

  const lockedCategory = effectiveLockedCategoryId
    ? orderedCategories.find((category) => category.id === effectiveLockedCategoryId)
    : undefined;

  const basePath = lockedSubcategory
    ? catalogSubcategoryPath(lockedSubcategory.category.slug, lockedSubcategory.slug)
    : lockedCategory
      ? catalogCategoryPath(lockedCategory.slug)
      : "/catalog";

  // 1. Build the base pool: locked category > query ?category= > all products
  const effectiveCategoryId = effectiveLockedCategoryId ?? (searchParams.category || undefined);
  const effectiveSubcategoryId = lockedSubcategoryId ?? (searchParams.subcategory || undefined);

  const queryResult = runCatalogQuery({
    products,
    q: searchParams.q,
    filters: {
      category: effectiveCategoryId,
      subcategory: effectiveSubcategoryId,
      dn: searchParams.dn,
      pn: searchParams.pn,
      model: searchParams.model,
      thread: searchParams.thread,
      material: searchParams.material,
      connection: searchParams.connection,
      connectionType: searchParams.connectionType,
      controlType: searchParams.controlType,
    },
    sort: parseCatalogSort(searchParams.sort),
    page: getMetaPageNumber(searchParams) ?? 1,
    pageSize: PAGE_SIZE,
    omitFullMatchedProductList: true,
  });

  // Compute subcategory labels from the category pool, then let facets decide counts.
  const subcategoryOptions = queryResult.facets.subcategories
    .map((facet) => {
      const meta = subcategoryById.get(facet.value);
      return {
        ...facet,
        label: meta?.name ?? facet.label,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label, "ru"));

  const categoryCountById = new Map(
    queryResult.facets.categories.map((facet) => [facet.value, facet.count] as const),
  );
  const subcategoryCountById = new Map(
    queryResult.facets.subcategories.map((facet) => [facet.value, facet.count] as const),
  );
  const quickLinks: CatalogQuickLink[] = lockedSubcategory && lockedCategory
    ? lockedCategory.subcategories.map((subcategory) => ({
        href: catalogSubcategoryPath(lockedCategory.slug, subcategory.slug),
        label: subcategory.name,
        count: subcategoryCountById.get(subcategory.id) ?? 0,
        active: subcategory.id === effectiveSubcategoryId,
      }))
    : lockedCategory
      ? []
      : orderedCategories.map((category) => ({
          href: catalogCategoryPath(category.slug),
          label: category.name,
          count: categoryCountById.get(category.id) ?? 0,
          active: category.id === effectiveCategoryId,
        }));

  const currentPage = queryResult.page;
  const pageItems = queryResult.pageItems;
  const totalPages = queryResult.totalPages;
  const start = (currentPage - 1) * PAGE_SIZE;
  const itemListJsonLd = buildCatalogItemListJsonLd(pageItems, {
    startPosition: start + 1,
    maxItems: ITEM_LIST_MAX_ITEMS,
  });

  // Preserve only the params that make sense in pagination links
  const paginationParams: Record<string, string | undefined> = {
    q: searchParams.q,
    category: effectiveLockedCategoryId ? undefined : searchParams.category,
    subcategory: lockedSubcategoryId ? undefined : searchParams.subcategory,
    dn: searchParams.dn,
    pn: searchParams.pn,
    model: searchParams.model,
    thread: searchParams.thread,
    material: searchParams.material,
    connection: searchParams.connection,
    connectionType: searchParams.connectionType,
    controlType: searchParams.controlType,
    sort: searchParams.sort,
    view: searchParams.view,
  };

  return (
    <div>
      {pageItems.length > 0 && (
        <JsonLd
          id={`catalog-item-list-${lockedCategoryId ?? "all"}-${currentPage}`}
          data={itemListJsonLd}
        />
      )}
      <Suspense>
        <CatalogFilters
          categories={orderedCategories}
          subcategoryOptions={subcategoryOptions}
          modelOptions={queryResult.facets.model}
          dnOptions={queryResult.facets.dn}
          pnOptions={queryResult.facets.pn}
          threadOptions={queryResult.facets.thread}
          materialOptions={queryResult.facets.material}
          connectionTypeOptions={queryResult.facets.connectionType}
          controlTypeOptions={queryResult.facets.controlType}
          quickLinks={quickLinks}
          total={queryResult.total}
          currentPage={currentPage}
          totalPages={totalPages}
          showCategoryTabs={!effectiveLockedCategoryId}
          showSubcategoryFilter={!lockedSubcategoryId}
          showThreadFilter={queryResult.facets.thread.length > 0}
        >
          <div className="flex flex-col gap-6">
            <ProductGrid
              products={pageItems}
              total={queryResult.total}
              query={queryResult.normalizedQuery.raw}
              hasActiveFilters={hasActiveFilters(searchParams)}
              view={searchParams.view === "list" ? "list" : "grid"}
              resetHref={basePath}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath={basePath}
              searchParams={paginationParams}
            />
          </div>
        </CatalogFilters>
      </Suspense>
    </div>
  );
}

function parseCatalogSort(sort: string | undefined) {
  if (sort === "name" || sort === "price-asc" || sort === "price-desc") return sort;
  return "relevance";
}

function hasActiveFilters(params: CatalogSearchParams): boolean {
  return Boolean(
    params.q ||
      params.category ||
      params.subcategory ||
      params.dn ||
      params.pn ||
      params.model ||
      params.thread ||
      params.material ||
      params.connection ||
      params.connectionType ||
      params.controlType,
  );
}
