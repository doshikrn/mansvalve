import { Suspense } from "react";

import { CatalogShell, type CatalogSearchParams } from "@/components/catalog/CatalogShell";
import type {
  PublicCatalogCategory,
  PublicCatalogProduct,
} from "@/lib/public-catalog";

type CatalogShellSuspenseProps = {
  products: PublicCatalogProduct[];
  categories: PublicCatalogCategory[];
  searchParams: Promise<CatalogSearchParams>;
  lockedCategoryId?: string;
  lockedSubcategoryId?: string;
};

async function CatalogShellWithResolvedSearch({
  searchParams,
  ...shellProps
}: CatalogShellSuspenseProps) {
  const resolved = await searchParams;
  return <CatalogShell {...shellProps} searchParams={resolved} />;
}

function CatalogShellFallback() {
  return (
    <div className="grid gap-6" aria-busy="true" aria-label="Загрузка каталога">
      <div className="site-skeleton h-12 rounded-lg" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="site-skeleton aspect-[4/3] rounded-xl" />
        ))}
      </div>
    </div>
  );
}

/**
 * Keeps `searchParams` out of static/ISR loaders: only this Suspense child
 * opts into dynamic rendering for URL filters and pagination.
 */
export function CatalogShellSuspense(props: CatalogShellSuspenseProps) {
  return (
    <Suspense fallback={<CatalogShellFallback />}>
      <CatalogShellWithResolvedSearch {...props} />
    </Suspense>
  );
}
