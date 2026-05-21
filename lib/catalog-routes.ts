/**
 * Публичные URL каталога (короткие пути без сегмента `/catalog/category/`).
 * Каноникал категорий: `/catalog/[categorySlug]`, подкатегорий: `/catalog/[categorySlug]/[subcategorySlug]`.
 */
export function catalogCategoryPath(categorySlug: string): string {
  return `/catalog/${categorySlug}`;
}

export function catalogSubcategoryPath(categorySlug: string, subcategorySlug: string): string {
  return `/catalog/${categorySlug}/${subcategorySlug}`;
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
