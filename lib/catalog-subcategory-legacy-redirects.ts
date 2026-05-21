import { catalogSubcategoryPath } from "@/lib/catalog-routes";

/**
 * Старые slug подкатегорий «Клапаны» до ТЗ → канонические пути `/catalog/klapany/...`.
 * Нужны, чтобы внешние ссылки на `/catalog/subcategory/klapany-*` не превращались в 404
 * после смены slug в данных.
 */
const LEGACY_KLAPANY_SUB_SLUG_TARGETS: Record<string, string> = {
  "klapany-obratnye": "podemnye",
  "klapany-povorotnye": "povorotnye-svarnye",
  "klapany-chugunnye": "mezhflancevye-pruzhinnye",
};

export function resolveLegacyKlapanySubcategoryTargetSlug(
  subcategorySlug: string,
): string | undefined {
  return LEGACY_KLAPANY_SUB_SLUG_TARGETS[subcategorySlug];
}

export function resolveLegacyKlapanySubcategoryCanonicalPath(
  subcategorySlug: string,
): string | undefined {
  const target = resolveLegacyKlapanySubcategoryTargetSlug(subcategorySlug);
  if (!target) return undefined;
  return catalogSubcategoryPath("klapany", target);
}
