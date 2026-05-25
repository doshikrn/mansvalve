"use client";

import { useEffect } from "react";

import { CatalogRouteError } from "@/components/catalog/CatalogRouteError";

type CatalogRouteErrorClientProps = {
  route: string;
  error: Error & { digest?: string };
  reset: () => void;
};

export function CatalogRouteErrorClient({
  route,
  error,
  reset,
}: CatalogRouteErrorClientProps) {
  useEffect(() => {
    console.error(`[catalog-route] boundary route=${route}`, error.message);
    if (error.stack) {
      console.error(error.stack);
    }
  }, [error, route]);

  return <CatalogRouteError route={route} showRetry onRetry={() => reset()} />;
}
