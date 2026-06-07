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

const ZADVIZHKI_CHUGUNNYE = catalogSubcategoryPath("zadvizhki", "zadvizhki-chugunnye");
const ZADVIZHKI_STALNYE = catalogSubcategoryPath("zadvizhki", "zadvizhki-stalnyye");
/**
 * Старые slug подкатегорий в формате `/catalog/[category]/[subcategory]`
 * (описательные slug из ранней версии каталога / Google).
 */
const ZATVORY_DISKOVYE = catalogSubcategoryPath("zatvory", "zatvory-diskovye");
const KLAPANY_PODEMNYE = catalogSubcategoryPath("klapany", "podemnye");

const LEGACY_NESTED_SUBCATEGORY_PATHS: Record<string, string> = {
  "zadvizhki/chugunnye-flantsevye-zadvizhki": ZADVIZHKI_CHUGUNNYE,
  "zadvizhki/stalnye-flantsevye-zadvizhki": ZADVIZHKI_STALNYE,
  "zadvizhki/zadvizhki-chugunnye-flantsevye": ZADVIZHKI_CHUGUNNYE,
  "zadvizhki/zadvizhki-stalnye-flantsevye": ZADVIZHKI_STALNYE,
  "zadvizhki/chugunnye-zadvizhki": ZADVIZHKI_CHUGUNNYE,
  "zadvizhki/stalnye-zadvizhki": ZADVIZHKI_STALNYE,
  "zadvizhki/chugunnye-flantsevye": ZADVIZHKI_CHUGUNNYE,
  "zadvizhki/stalnye-flantsevye": ZADVIZHKI_STALNYE,
  "zatvory/diskovye": ZATVORY_DISKOVYE,
  "zatvory/diskovye-zatvory": ZATVORY_DISKOVYE,
  "zatvory/zatvory-diskovye": ZATVORY_DISKOVYE,
  "zatvory/zatvory-diskovye-zatvory": ZATVORY_DISKOVYE,
  "klapany/obratnye": KLAPANY_PODEMNYE,
  "klapany/obratnye-klapany": KLAPANY_PODEMNYE,
  "klapany/klapany-obratnye": KLAPANY_PODEMNYE,
  "klapany/podemnye": KLAPANY_PODEMNYE,
};

const LEGACY_SUBCATEGORY_CANONICAL_PATHS: Record<string, string> = {
  "chugunnye-flantsevye-zadvizhki": ZADVIZHKI_CHUGUNNYE,
  "stalnye-flantsevye-zadvizhki": ZADVIZHKI_STALNYE,
  "zadvizhki-chugunnye-flantsevye": ZADVIZHKI_CHUGUNNYE,
  "zadvizhki-stalnye-flantsevye": ZADVIZHKI_STALNYE,
  "chugunnye-zadvizhki": ZADVIZHKI_CHUGUNNYE,
  "stalnye-zadvizhki": ZADVIZHKI_STALNYE,
  "zadvizhki-chugunnye": ZADVIZHKI_CHUGUNNYE,
  "zadvizhki-klinovye": catalogSubcategoryPath("zadvizhki", "zadvizhki-klinovye"),
  "zadvizhki-shibernye": catalogSubcategoryPath("zadvizhki", "zadvizhki-shibernye"),
  "zadvizhki-stalnyye": catalogSubcategoryPath("zadvizhki", "zadvizhki-stalnyye"),
  "zadvizhki-s-elektroprivodom": catalogSubcategoryPath("zadvizhki", "zadvizhki-s-elektroprivodom"),
  "zadvizhki-pn40-pn64": catalogSubcategoryPath("zadvizhki", "zadvizhki-pn40-pn64"),
  "zadvizhki-pod-privarku": catalogSubcategoryPath("zadvizhki", "zadvizhki-pod-privarku"),
  "zatvory-mezhflantsevy": catalogSubcategoryPath("zatvory", "zatvory-mezhflantsevy"),
  "zatvory-flantsevy": catalogSubcategoryPath("zatvory", "zatvory-flantsevy"),
  "zatvory-diskovye": catalogSubcategoryPath("zatvory", "zatvory-diskovye"),
  "zatvory-s-uplotneniem": catalogSubcategoryPath("zatvory", "zatvory-s-uplotneniem"),
  "krany-flantsevy": catalogSubcategoryPath("krany-sharovye", "krany-flantsevy"),
  "krany-pod-privarku": catalogSubcategoryPath("krany-sharovye", "krany-pod-privarku"),
  "krany-tselnosvarnye": catalogSubcategoryPath("krany-sharovye", "krany-tselnosvarnye"),
  "podemnye": catalogSubcategoryPath("klapany", "podemnye"),
  "povorotnye-flancevye": catalogSubcategoryPath("klapany", "povorotnye-flancevye"),
  "povorotnye-svarnye": catalogSubcategoryPath("klapany", "povorotnye-svarnye"),
  "mezhflancevye-pruzhinnye": catalogSubcategoryPath("klapany", "mezhflancevye-pruzhinnye"),
  "mezhflancevye-dvuhstvorchatye": catalogSubcategoryPath("klapany", "mezhflancevye-dvuhstvorchatye"),
  "sharovye": catalogSubcategoryPath("klapany", "sharovye"),
  "filtry-korzinchatye": catalogSubcategoryPath("filtry-i-kompensatory", "filtry-korzinchatye"),
  "kompensatory": catalogSubcategoryPath("filtry-i-kompensatory", "kompensatory"),
  "flansy": catalogSubcategoryPath("flansy-i-otvody", "flansy"),
  "otvody": catalogSubcategoryPath("flansy-i-otvody", "otvody"),
  "elektroprivody-dlya-zadvizhek": catalogSubcategoryPath("elektroprivody", "elektroprivody-dlya-zadvizhek"),
  "elektroprivody-dlya-zatvorov": catalogSubcategoryPath("elektroprivody", "elektroprivody-dlya-zatvorov"),
  "elektroprivody-dlya-klapanov": catalogSubcategoryPath("elektroprivody", "elektroprivody-dlya-klapanov"),
  "krepezh-bolty": catalogSubcategoryPath("krepezh-i-prokladki", "krepezh-bolty"),
  "krepezh-shpilki": catalogSubcategoryPath("krepezh-i-prokladki", "krepezh-shpilki"),
  "krepezh-gayki": catalogSubcategoryPath("krepezh-i-prokladki", "krepezh-gayki"),
  "prokladki-paronit-ponb": catalogSubcategoryPath("krepezh-i-prokladki", "prokladki-paronit-ponb"),
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

export function resolveLegacySubcategoryCanonicalPath(
  subcategorySlug: string,
): string | undefined {
  return (
    LEGACY_SUBCATEGORY_CANONICAL_PATHS[subcategorySlug] ||
    resolveLegacyKlapanySubcategoryCanonicalPath(subcategorySlug)
  );
}

export function resolveLegacyNestedSubcategoryCanonicalPath(
  categorySlug: string,
  subcategorySlug: string,
): string | undefined {
  return LEGACY_NESTED_SUBCATEGORY_PATHS[`${categorySlug}/${subcategorySlug}`];
}

/** For redirect QA scripts — flat + nested legacy subcategory targets. */
export function listLegacySubcategoryRedirectEntries(): Array<{
  source: string;
  target: string;
}> {
  const flat = Object.entries(LEGACY_SUBCATEGORY_CANONICAL_PATHS).map(([slug, target]) => ({
    source: `/catalog/subcategory/${slug}`,
    target,
  }));
  const nested = Object.entries(LEGACY_NESTED_SUBCATEGORY_PATHS).map(([key, target]) => ({
    source: `/catalog/${key}`,
    target,
  }));
  return [...flat, ...nested];
}
