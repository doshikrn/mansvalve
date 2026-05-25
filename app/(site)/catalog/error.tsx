"use client";

import { CatalogRouteErrorClient } from "@/components/catalog/CatalogRouteErrorClient";

export default function CatalogSegmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <CatalogRouteErrorClient route="/catalog" error={error} reset={reset} />
  );
}
