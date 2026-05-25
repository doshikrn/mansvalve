import "server-only";

import { getPublicCatalogRuntimeInfo } from "@/lib/public-catalog";

export type CatalogRouteContext = {
  route: string;
  categorySlug?: string;
  subcategorySlug?: string;
  landingSlug?: string;
};

export type CatalogRouteCounts = {
  productsCount?: number;
  categoriesCount?: number;
};

export function isCatalogQueryDebug(): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.CATALOG_QUERY_DEBUG === "1"
  );
}

function formatCatalogRuntimeLabel(): string {
  const info = getPublicCatalogRuntimeInfo();
  return `configured=${info.configuredSource} effective=${info.effectiveSource} dbConfigured=${info.databaseConfigured}`;
}

function formatSlugContext(ctx: CatalogRouteContext): string {
  return [
    ctx.categorySlug ? `categorySlug=${ctx.categorySlug}` : "",
    ctx.subcategorySlug ? `subcategorySlug=${ctx.subcategorySlug}` : "",
    ctx.landingSlug ? `landingSlug=${ctx.landingSlug}` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function logCatalogRouteSuccess(
  ctx: CatalogRouteContext,
  counts: CatalogRouteCounts & { ms?: number },
): void {
  const slugs = formatSlugContext(ctx);
  const countPart = [
    counts.productsCount != null ? `products=${counts.productsCount}` : "",
    counts.categoriesCount != null ? `categories=${counts.categoriesCount}` : "",
    counts.ms != null ? `ms=${counts.ms.toFixed(1)}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const line = `[catalog-route] ok route=${ctx.route} ${formatCatalogRuntimeLabel()}${slugs ? ` ${slugs}` : ""}${countPart ? ` ${countPart}` : ""}`;

  if (isCatalogQueryDebug()) {
    console.debug(line);
    return;
  }

  if (process.env.NODE_ENV === "production") {
    console.info(line);
  }
}

export function logCatalogRouteError(ctx: CatalogRouteContext, error: unknown): void {
  const err = error instanceof Error ? error : new Error(String(error));
  const slugs = formatSlugContext(ctx);

  console.error(
    `[catalog-route] FAIL route=${ctx.route} ${formatCatalogRuntimeLabel()}${slugs ? ` ${slugs}` : ""}`,
    err.message,
  );
  if (err.stack) {
    console.error(err.stack);
  }
  if (process.env.NODE_ENV === "development") {
    console.error(err);
  }
}

export type CatalogRouteLoadResult<T> =
  | { ok: true; data: T }
  | { ok: false };

/**
 * Safe catalog data load: logs success/failure, rethrows in development, returns
 * `{ ok: false }` in production for inline fallback UI.
 */
export async function withCatalogRouteLoad<T>(
  ctx: CatalogRouteContext,
  loader: () => Promise<T>,
  countsFrom?: (data: T) => CatalogRouteCounts,
): Promise<CatalogRouteLoadResult<T>> {
  const t0 = isCatalogQueryDebug() ? performance.now() : 0;

  try {
    const data = await loader();
    const counts = countsFrom?.(data) ?? {};
    logCatalogRouteSuccess(ctx, {
      ...counts,
      ms: isCatalogQueryDebug() ? performance.now() - t0 : undefined,
    });
    return { ok: true, data };
  } catch (error) {
    logCatalogRouteError(ctx, error);
    if (process.env.NODE_ENV === "development") {
      throw error;
    }
    return { ok: false };
  }
}
