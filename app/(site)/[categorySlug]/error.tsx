"use client";

import { CatalogRouteErrorClient } from "@/components/catalog/CatalogRouteErrorClient";

/** SEO landing / category slug segment — catalog-style fallback. */
export default function CategorySlugSegmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <CatalogRouteErrorClient
      route="/[categorySlug]"
      error={error}
      reset={reset}
    />
  );
}
