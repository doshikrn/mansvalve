import type { PublicCatalogProduct } from "@/lib/public-catalog";
import {
  findGateValveCatalogProduct,
  GATE_VALVE_SEO_PAGES,
  getGateValveSeoPageForProduct,
  type GateValveSeoPage,
} from "./gate-valves";
import {
  findIndustrialSeriesCatalogProduct,
  getIndustrialSeriesSeoPageByPath,
  getIndustrialSeriesSeoPageForProduct,
  INDUSTRIAL_SERIES_SEO_PAGES,
  type IndustrialSeriesSeoPage,
} from "./industrial-series";

export type ProductSeriesSeoPage = GateValveSeoPage | IndustrialSeriesSeoPage;

export const PRODUCT_SERIES_SEO_PAGES: ProductSeriesSeoPage[] = [
  ...GATE_VALVE_SEO_PAGES,
  ...INDUSTRIAL_SERIES_SEO_PAGES,
];

export function getSeriesPagePath(page: ProductSeriesSeoPage): string {
  return "path" in page ? page.path : `/${page.categorySlug}/${page.slug}`;
}

export function getSeriesPageCatalogCategoryId(page: ProductSeriesSeoPage): string {
  return "catalogCategoryId" in page ? page.catalogCategoryId : page.categorySlug;
}

export function getSeriesPageCatalogSubcategoryId(page: ProductSeriesSeoPage): string {
  if ("catalogSubcategoryId" in page) return page.catalogSubcategoryId;
  return page.series === "30ch6br" ? "zadvizhki-chugunnye" : "zadvizhki-stalnyye";
}

export function getSeriesPageCategoryLabel(page: ProductSeriesSeoPage): string {
  if ("catalogCategoryName" in page) return page.catalogCategoryName;
  return "Задвижки";
}

export function getSeriesPageGroupKey(page: ProductSeriesSeoPage): string {
  const kind = "kind" in page ? page.kind : "gate-valve";
  const connection = "connectionVariant" in page ? page.connectionVariant : "default";
  return `${kind}__${page.series}__${connection}__pn${page.pn}`;
}

export function getSeriesPageGroupLabel(page: ProductSeriesSeoPage): string {
  if ("kind" in page && page.kind === "compensator-kso-k") {
    return "Компенсаторы КСО.К · PN16";
  }
  if ("kind" in page && page.kind === "check-valve-19s38nzh") {
    return "Клапаны обратные 19с38нж · PN16";
  }
  const connection =
    "connectionVariant" in page && page.connectionVariant === "welding"
      ? "под приварку"
      : "фланцевое";
  return `${page.model} · ${connection} · PN${page.pn}`;
}

export function getSeriesSeoPageForProduct(
  product: PublicCatalogProduct,
): ProductSeriesSeoPage | undefined {
  return (
    getGateValveSeoPageForProduct(product) ??
    getIndustrialSeriesSeoPageForProduct(product)
  );
}

export function findSeriesCatalogProduct(
  products: PublicCatalogProduct[],
  page: ProductSeriesSeoPage,
): PublicCatalogProduct | undefined {
  if ("kind" in page) return findIndustrialSeriesCatalogProduct(products, page);
  return findGateValveCatalogProduct(products, page);
}

export function getSeriesSeoPageByPath(path: string): ProductSeriesSeoPage | undefined {
  const industrial = getIndustrialSeriesSeoPageByPath(path);
  if (industrial) return industrial;
  return GATE_VALVE_SEO_PAGES.find((page) => getSeriesPagePath(page) === path);
}

export function getRelatedSeriesSeoPages(page: ProductSeriesSeoPage): ProductSeriesSeoPage[] {
  const key = getSeriesPageGroupKey(page);
  return PRODUCT_SERIES_SEO_PAGES.filter((candidate) => {
    if (candidate.slug === page.slug && getSeriesPagePath(candidate) === getSeriesPagePath(page)) {
      return false;
    }
    return getSeriesPageGroupKey(candidate) === key;
  });
}

