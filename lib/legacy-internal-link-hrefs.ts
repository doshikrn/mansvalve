import { catalogCategoryPath, catalogSubcategoryPath } from "@/lib/catalog-routes";

/**
 * Known legacy internal hrefs → актуальные публичные URL.
 * Используется при нормализации CMS/footer/nav и в audit-скриптах.
 */
export const LEGACY_INTERNAL_LINK_HREFS: Record<string, string> = {
  "/catalog/subcategory/zatvory-diskovye": catalogSubcategoryPath("zatvory", "zatvory-diskovye"),
  "/catalog/subcategory/klapany-obratnye": catalogSubcategoryPath("klapany", "podemnye"),
  "/catalog/subcategory/flansy": catalogSubcategoryPath("flansy-i-otvody", "flansy"),
  "/catalog/subcategory/zadvizhki-chugunnye": catalogSubcategoryPath("zadvizhki", "zadvizhki-chugunnye"),
  "/catalog/subcategory/zadvizhki-stalnyye": catalogSubcategoryPath("zadvizhki", "zadvizhki-stalnyye"),
  "/catalog/category/zadvizhki": catalogCategoryPath("zadvizhki"),
  "/catalog/category/zatvory": catalogCategoryPath("zatvory"),
  "/catalog/category/klapany": catalogCategoryPath("klapany"),
  "/catalog/category/krany-sharovye": catalogCategoryPath("krany-sharovye"),
  "/catalog/category/flansy-i-otvody": catalogCategoryPath("flansy-i-otvody"),
  "/catalog/category/elektroprivody": catalogCategoryPath("elektroprivody"),
  "/catalog/zatvory/diskovye": catalogSubcategoryPath("zatvory", "zatvory-diskovye"),
  "/catalog/zatvory/diskovye-zatvory": catalogSubcategoryPath("zatvory", "zatvory-diskovye"),
  "/catalog/zatvory/zatvory-diskovye-zatvory": catalogSubcategoryPath("zatvory", "zatvory-diskovye"),
  "/catalog/klapany/obratnye": catalogCategoryPath("klapany"),
  "/catalog/klapany/obratnye-klapany": catalogSubcategoryPath("klapany", "podemnye"),
  "/catalog/klapany/klapany-obratnye": catalogSubcategoryPath("klapany", "podemnye"),
  "/catalog/zadvizhki/chugunnye-flantsevye-zadvizhki": catalogSubcategoryPath(
    "zadvizhki",
    "zadvizhki-chugunnye",
  ),
  "/catalog/zadvizhki/stalnye-flantsevye-zadvizhki": catalogSubcategoryPath(
    "zadvizhki",
    "zadvizhki-stalnyye",
  ),
};

export function normalizeLegacyInternalHref(href: string): string {
  const trimmed = href.trim();
  if (!trimmed.startsWith("/")) return href;
  const withoutHash = trimmed.split("#")[0] ?? trimmed;
  const withoutQuery = withoutHash.split("?")[0] ?? withoutHash;
  const normalizedPath = withoutQuery.replace(/\/+$/, "") || "/";
  return LEGACY_INTERNAL_LINK_HREFS[normalizedPath] ?? href;
}
