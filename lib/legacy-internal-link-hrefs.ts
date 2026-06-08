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
  "/catalog/zatvory/zatvory-diskovye": catalogSubcategoryPath("zatvory", "zatvory-diskovye"),
  "/catalog/zatvory/zatvory-diskovye-zatvory": catalogSubcategoryPath("zatvory", "zatvory-diskovye"),
  "/catalog/klapany/obratnye": catalogSubcategoryPath("klapany", "podemnye"),
  "/catalog/klapany/obratnye-klapany": catalogSubcategoryPath("klapany", "podemnye"),
  "/catalog/klapany/klapany-obratnye": catalogSubcategoryPath("klapany", "podemnye"),
  "/catalog/klapany/podemnye": catalogSubcategoryPath("klapany", "podemnye"),
  "/catalog/flansy-i-otvody/flansy": catalogSubcategoryPath("flansy-i-otvody", "flansy"),
  "/catalog/zadvizhki/chugunnye-flantsevye-zadvizhki": catalogSubcategoryPath(
    "zadvizhki",
    "zadvizhki-chugunnye",
  ),
  "/catalog/zadvizhki/stalnye-flantsevye-zadvizhki": catalogSubcategoryPath(
    "zadvizhki",
    "zadvizhki-stalnyye",
  ),
};

function mergeHrefParts(target: string, query: string, hash: string): string {
  const [targetPathAndSearch, targetHash = ""] = target.split("#");
  const [targetPath, targetSearch = ""] = targetPathAndSearch.split("?");
  const params = new URLSearchParams(targetSearch);

  if (query) {
    const incoming = new URLSearchParams(query.slice(1));
    for (const [key, value] of incoming.entries()) {
      params.set(key, value);
    }
  }

  const search = params.toString();
  const suffix = hash || (targetHash ? `#${targetHash}` : "");
  return search ? `${targetPath}?${search}${suffix}` : `${targetPath}${suffix}`;
}

export function normalizeLegacyInternalHref(href: string): string {
  const trimmed = href.trim();
  if (!trimmed.startsWith("/")) return href;
  const match = trimmed.match(/^([^?#]*)(\?[^#]*)?(#.*)?$/);
  const path = match?.[1] ?? trimmed;
  const query = match?.[2] ?? "";
  const hash = match?.[3] ?? "";
  const normalizedPath = path.replace(/\/+$/, "") || "/";
  const target = LEGACY_INTERNAL_LINK_HREFS[normalizedPath];
  return target ? mergeHrefParts(target, query, hash) : href;
}
