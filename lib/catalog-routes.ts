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
