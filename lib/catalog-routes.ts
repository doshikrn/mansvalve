import { encodeRedirectPath } from "./catalog-url-encoding";

/**
 * Публичные URL каталога.
 * Каноникал категорий: `/catalog/[categorySlug]`.
 * Подкатегории не являются отдельными страницами: открываются как фильтр категории.
 */
export function catalogCategoryPath(categorySlug: string): string {
  return `/catalog/${categorySlug}`;
}

const SUBCATEGORY_ROUTE_SLUG_ALIASES: Record<string, string> = {
  "klapany-obratnye": "podemnye",
};

const SUBCATEGORY_CANONICAL_ROUTE_SLUGS: Record<string, string> = {
  podemnye: "klapany-obratnye",
};

export function resolveCatalogSubcategoryRouteSlug(subcategorySlug: string): string {
  return SUBCATEGORY_ROUTE_SLUG_ALIASES[subcategorySlug] ?? subcategorySlug;
}

export function getCatalogSubcategoryCanonicalRouteSlug(subcategorySlug: string): string {
  return SUBCATEGORY_CANONICAL_ROUTE_SLUGS[subcategorySlug] ?? subcategorySlug;
}

export function catalogSubcategoryPath(_categorySlug: string, subcategorySlug: string): string {
  return `/catalog/${encodeURIComponent(getCatalogSubcategoryCanonicalRouteSlug(subcategorySlug))}`;
}

/**
 * Публичный href листинга подкатегории для ссылок в UI/JSON-LD.
 * Некоторые slug из JSON (например `zadvizhki-chugunnye`) на production открываются
 * как фильтр категории, а не отдельная flat-страница `/catalog/[subcategorySlug]`.
 */
function zadvizhkiSubcategoryFilter(subcategorySlug: string): string {
  return `/catalog/zadvizhki?subcategory=${subcategorySlug}`;
}

/** Flat subcategory slug → production canonical listing href (flat или `?subcategory=`). */
export const SUBCATEGORY_LISTING_HREF_OVERRIDES: Record<string, string> = {
  "zadvizhki-chugunnye": zadvizhkiSubcategoryFilter("zadvizhki-chugunnye"),
  "zadvizhki-stalnyye": zadvizhkiSubcategoryFilter("zadvizhki-stalnyye"),
  "zadvizhki-klinovye": zadvizhkiSubcategoryFilter("zadvizhki-klinovye"),
  "zadvizhki-pod-privarku": zadvizhkiSubcategoryFilter("zadvizhki-pod-privarku"),
  "zadvizhki-pn40-pn64": zadvizhkiSubcategoryFilter("zadvizhki-pn40-pn64"),
  "stalnye-flantsevye-zadvizhki": zadvizhkiSubcategoryFilter("zadvizhki-stalnyye"),
  "zadvizhki-chugunnye-flantsevye": zadvizhkiSubcategoryFilter("zadvizhki-chugunnye"),
  "chugunnye-flantsevye-zadvizhki": zadvizhkiSubcategoryFilter("zadvizhki-chugunnye"),
};

export function catalogSubcategoryListingHref(
  categorySlug: string,
  subcategorySlug: string,
): string {
  const routeSlug = getCatalogSubcategoryCanonicalRouteSlug(subcategorySlug);
  return (
    SUBCATEGORY_LISTING_HREF_OVERRIDES[routeSlug] ??
    catalogSubcategoryPath(categorySlug, subcategorySlug)
  );
}

/** @deprecated Используйте `ALL_CATALOG_PATH_REDIRECTS` из `catalog-path-redirects`. */
export const SUBCATEGORY_FLAT_PATH_REDIRECTS: ReadonlyArray<{
  source: string;
  destination: string;
}> = Object.entries(SUBCATEGORY_LISTING_HREF_OVERRIDES).map(([slug, destination]) => ({
  source: `/catalog/${slug}`,
  destination: encodeRedirectPath(destination),
}));

export function catalogNestedProductPath(
  categorySlug: string,
  subcategorySlug: string,
  productSlug: string,
): string {
  return `/catalog/${categorySlug}/${subcategorySlug}/${productSlug}`;
}

/** Найти родительскую категорию по id подкатегории (id и slug в данных совпадают). */
export function findCategorySlugForSubcategoryId(
  subcategoryId: string,
  categories: Array<{ slug: string; subcategories: Array<{ id: string }> }>,
): string | undefined {
  for (const category of categories) {
    if (category.subcategories.some((sub) => sub.id === subcategoryId)) {
      return category.slug;
    }
  }
  return undefined;
}
