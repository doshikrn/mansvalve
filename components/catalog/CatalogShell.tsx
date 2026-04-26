import { Suspense } from "react";

import { ProductGrid } from "@/components/catalog/ProductGrid";
import { Pagination } from "@/components/catalog/Pagination";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildCatalogItemListJsonLd } from "@/lib/structured-data";
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
  thread?: string;
  material?: string;
  connectionType?: string;
  controlType?: string;
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

function applySecondaryFilters(pool: Product[], params: CatalogSearchParams): Product[] {
  let result = pool;

  if (params.subcategory) {
    result = result.filter((p) => p.subcategory === params.subcategory);
  }
  if (params.dn) {
    const dn = parseInt(params.dn, 10);
    if (!isNaN(dn)) result = result.filter((p) => p.dn === dn);
  }
  if (params.pn) {
    const pn = parseInt(params.pn, 10);
    if (!isNaN(pn)) result = result.filter((p) => p.pn === pn);
  }
  if (params.thread) {
    result = result.filter((p) => p.thread === params.thread);
  }
  if (params.material) {
    result = result.filter((p) => p.material === params.material);
  }
  if (params.connectionType) {
    result = result.filter((p) => p.connectionType === params.connectionType);
  }
  if (params.controlType) {
    result = result.filter((p) => p.controlType === params.controlType);
  }
  if (params.q?.trim()) {
    const q = params.q.trim().toLowerCase();
    result = result.filter((p) => {
      const hay = [
        p.name,
        p.material,
        p.connectionType,
        p.controlType,
        p.categoryName,
        p.subcategoryName,
        p.shortDescription,
        p.dn != null ? `dn${p.dn}` : "",
        p.dn != null ? String(p.dn) : "",
        p.pn != null ? `pn${p.pn}` : "",
        p.pn != null ? String(p.pn) : "",
        p.thread ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }

  return result;
}

type SubcategoryOption = { id: string; name: string };

export function CatalogShell({
  products,
  categories,
  searchParams,
  lockedCategoryId,
  lockedSubcategoryId,
}: CatalogShellProps) {
  const subcategoryById = new Map(
    categories.flatMap((category) =>
      category.subcategories.map((sub) => [sub.id, { ...sub, category }] as const),
    ),
  );

  const lockedSubcategory = lockedSubcategoryId
    ? subcategoryById.get(lockedSubcategoryId)
    : undefined;
  const effectiveLockedCategoryId = lockedCategoryId ?? lockedSubcategory?.parentCategory;

  const lockedCategory = effectiveLockedCategoryId
    ? categories.find((category) => category.id === effectiveLockedCategoryId)
    : undefined;

  const basePath = lockedSubcategory
    ? `/catalog/subcategory/${lockedSubcategory.slug}`
    : lockedCategory
      ? `/catalog/category/${lockedCategory.slug}`
      : "/catalog";

  // 1. Build the base pool: locked category > query ?category= > all products
  const effectiveCategoryId = effectiveLockedCategoryId ?? (searchParams.category || undefined);
  const effectiveSubcategoryId = lockedSubcategoryId ?? (searchParams.subcategory || undefined);
  const categoryPool = effectiveCategoryId
    ? products.filter((p) => p.category === effectiveCategoryId)
    : products;
  const pool = effectiveSubcategoryId
    ? categoryPool.filter((p) => p.subcategory === effectiveSubcategoryId)
    : categoryPool;

  // 2. Compute filter options from the narrowed pool (before secondary filters)
  const subcategoryOptions: SubcategoryOption[] = [
    ...new Set(categoryPool.map((p) => p.subcategory)),
  ]
    .map((id) => {
      const meta = subcategoryById.get(id);
      return {
        id,
        name: meta?.name ?? id,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, "ru"));

  const dnOptions = [
    ...new Set(pool.map((p) => p.dn).filter((v): v is number => v != null)),
  ].sort((a, b) => a - b);
  const pnOptions = [
    ...new Set(pool.map((p) => p.pn).filter((v): v is number => v != null)),
  ].sort((a, b) => a - b);
  const materialOptions = [...new Set(pool.map((p) => p.material).filter(Boolean))].sort();
  const threadOptions = [...new Set(pool.map((p) => p.thread).filter(Boolean) as string[])].sort(
    (a, b) => {
      const aNum = parseInt(a.replace(/[^\d]/g, ""), 10);
      const bNum = parseInt(b.replace(/[^\d]/g, ""), 10);
      return aNum - bNum;
    },
  );
  const connectionTypeOptions = [
    ...new Set(pool.map((p) => p.connectionType).filter(Boolean)),
  ].sort((a, b) => a.localeCompare(b, "ru"));
  const controlTypeOptions = [...new Set(pool.map((p) => p.controlType).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b, "ru"),
  );

  // 3. Apply remaining (secondary) filters: dn, pn, thread, material, connectionType, controlType, q
  const currentPage = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const filtered = applySecondaryFilters(pool, {
    ...searchParams,
    subcategory: lockedSubcategoryId ? undefined : searchParams.subcategory,
  });
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);
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
    thread: searchParams.thread,
    material: searchParams.material,
    connectionType: searchParams.connectionType,
    controlType: searchParams.controlType,
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
          categories={categories}
          subcategoryOptions={subcategoryOptions}
          dnOptions={dnOptions}
          pnOptions={pnOptions}
          threadOptions={threadOptions}
          materialOptions={materialOptions}
          connectionTypeOptions={connectionTypeOptions}
          controlTypeOptions={controlTypeOptions}
          showCategoryTabs={!effectiveLockedCategoryId}
          showSubcategoryFilter={!lockedSubcategoryId}
          showThreadFilter={threadOptions.length > 0}
        />
      </Suspense>

      <div className="mt-6">
        <ProductGrid products={pageItems} total={filtered.length} />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          basePath={basePath}
          searchParams={paginationParams}
        />
      </div>
    </div>
  );
}
