import { encodeRedirectPath } from "./catalog-url-encoding";
import { SUBCATEGORY_LISTING_HREF_OVERRIDES } from "./catalog-routes";

/** Старые category slug из JSON → актуальные flat category URL на production DB. */
export const CATALOG_CATEGORY_LEGACY_REDIRECTS: ReadonlyArray<{
  source: string;
  destination: string;
}> = [
  { source: "/catalog/zatvory", destination: "/catalog/zatvory-diskovye" },
  { source: "/catalog/klapany", destination: "/catalog/klapany-obratnye" },
];

/** SEO landing, которая на production не резолвится — только 308 на catalog subcategory. */
export const CATALOG_LANDING_LEGACY_REDIRECTS: ReadonlyArray<{
  source: string;
  destination: string;
}> = [
  {
    source: "/zatvory/mezhflantsevye",
    destination: "/catalog/zatvory-diskovye-mezhflantsevye",
  },
];

function buildSubcategoryFlatRedirects(): Array<{ source: string; destination: string }> {
  return Object.entries(SUBCATEGORY_LISTING_HREF_OVERRIDES).map(([slug, destination]) => ({
    source: `/catalog/${slug}`,
    destination: encodeRedirectPath(destination),
  }));
}

/** Все точечные 308 каталога для next.config (без catch-all). */
export const ALL_CATALOG_PATH_REDIRECTS: ReadonlyArray<{
  source: string;
  destination: string;
}> = [
  ...CATALOG_CATEGORY_LEGACY_REDIRECTS.map(({ source, destination }) => ({
    source,
    destination: encodeRedirectPath(destination),
  })),
  ...CATALOG_LANDING_LEGACY_REDIRECTS.map(({ source, destination }) => ({
    source,
    destination: encodeRedirectPath(destination),
  })),
  ...buildSubcategoryFlatRedirects(),
];

const REDIRECT_SOURCE_PATHS = new Set(ALL_CATALOG_PATH_REDIRECTS.map((entry) => entry.source));

const LANDING_REDIRECT_ONLY_PATHS = new Set(
  CATALOG_LANDING_LEGACY_REDIRECTS.map((entry) => entry.source),
);

export function isCatalogRedirectSourcePath(path: string): boolean {
  const pathname = path.split("?")[0]?.split("#")[0]?.replace(/\/+$/, "") || "/";
  return REDIRECT_SOURCE_PATHS.has(pathname);
}

export function isLandingRedirectOnlyPath(path: string): boolean {
  const pathname = path.split("?")[0]?.split("#")[0]?.replace(/\/+$/, "") || "/";
  return LANDING_REDIRECT_ONLY_PATHS.has(pathname);
}

export function listCatalogPathRedirectEntries(): Array<{ source: string; target: string }> {
  return ALL_CATALOG_PATH_REDIRECTS.map(({ source, destination }) => ({
    source,
    target: destination,
  }));
}
