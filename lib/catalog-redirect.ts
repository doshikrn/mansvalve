/**
 * Redirect helpers for catalog → product canonical URLs.
 * Listing redirects (category/subcategory) must keep filter query params.
 */

/** Keys from CatalogShell / CatalogFilters — not part of product canonical URLs. */
export const CATALOG_FILTER_QUERY_KEYS = new Set([
  "q",
  "page",
  "category",
  "subcategory",
  "dn",
  "pn",
  "thread",
  "material",
  "connectionType",
  "connection",
  "controlType",
  "model",
  "sort",
]);

export type SearchParamsInput = Record<string, string | string[] | undefined>;

/** Accepts Next.js searchParams and CatalogShell query objects. */
export type SearchParamsLike = {
  [key: string]: string | string[] | undefined;
};

/**
 * Removes catalog listing/filter params; keeps other keys (e.g. UTM) if present.
 */
export function stripCatalogFilterParams(
  searchParams: SearchParamsLike,
): SearchParamsInput {
  const out: SearchParamsInput = {};
  for (const [key, value] of Object.entries(searchParams)) {
    if (CATALOG_FILTER_QUERY_KEYS.has(key)) continue;
    if (value === undefined || value === "") continue;
    out[key] = value;
  }
  return out;
}

function appendQueryString(path: string, searchParams: SearchParamsInput): string {
  const [pathAndSearch, hash = ""] = path.split("#");
  const [pathname, existingSearch = ""] = pathAndSearch.split("?");
  const params = new URLSearchParams(existingSearch);
  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item) params.append(key, item);
      }
      continue;
    }
    if (value) params.set(key, value);
  }
  const search = params.toString();
  const suffix = hash ? `#${hash}` : "";
  return search ? `${pathname}?${search}${suffix}` : `${pathname}${suffix}`;
}

/**
 * Builds the target URL for permanentRedirect to a product canonical path.
 * Catalog filter query is stripped; non-filter params are preserved when needed.
 */
export function buildCleanProductRedirectUrl(
  canonicalPath: string,
  searchParams?: SearchParamsLike,
): string {
  if (!searchParams || Object.keys(searchParams).length === 0) {
    return canonicalPath;
  }
  return appendQueryString(canonicalPath, stripCatalogFilterParams(searchParams));
}

/** Category/subcategory listing redirects keep filter query params. */
export function buildCatalogListingRedirectUrl(
  canonicalPath: string,
  searchParams?: SearchParamsLike,
): string {
  if (!searchParams || Object.keys(searchParams).length === 0) {
    return canonicalPath;
  }
  return appendQueryString(canonicalPath, searchParams as SearchParamsInput);
}
