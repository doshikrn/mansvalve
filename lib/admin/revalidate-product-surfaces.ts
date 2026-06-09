import { revalidatePath } from "next/cache";

import { CATALOG_LANDING_PAGES } from "@/lib/catalog-seo";
import {
  catalogCategoryPath,
  catalogNestedProductPath,
  catalogSubcategoryPath,
} from "@/lib/catalog-routes";
import { productDetailToPublicCatalogProduct } from "@/lib/public-catalog/from-product-detail";
import { buildPublicProductView } from "@/lib/public-catalog/product-view";
import type { ProductDetail } from "@/lib/services/products";
import { getGateValveSeoPageForProduct } from "@/lib/seo-product-pages/gate-valves";

function collectProductSurfacePaths(product: ProductDetail): string[] {
  const paths = new Set<string>();
  const add = (path: string | null | undefined) => {
    const trimmed = path?.trim();
    if (!trimmed) return;
    paths.add(trimmed);
  };

  const publicProduct = productDetailToPublicCatalogProduct(product);
  const view = buildPublicProductView(publicProduct);

  add(`/tovar/${product.slug}`);
  add(view.canonicalPath);

  if (product.categorySlug) {
    add(catalogCategoryPath(product.categorySlug));
    add(`/catalog/${product.categorySlug}`);
    add(`/catalog/category/${product.categorySlug}`);
  }

  if (product.subcategorySlug) {
    add(`/catalog/subcategory/${product.subcategorySlug}`);
    if (product.categorySlug) {
      add(catalogSubcategoryPath(product.categorySlug, product.subcategorySlug));
      add(`/catalog/${product.categorySlug}/${product.subcategorySlug}`);
      add(
        catalogNestedProductPath(
          product.categorySlug,
          product.subcategorySlug,
          product.slug,
        ),
      );
    }
  }

  const gateValvePage = getGateValveSeoPageForProduct(publicProduct);
  if (gateValvePage) {
    add(`/${gateValvePage.categorySlug}/${gateValvePage.slug}`);
  }

  const categorySlug = product.categorySlug || publicProduct.category;
  const productSlug = product.slug.toLowerCase();
  const canonical = view.canonicalPath.toLowerCase();
  for (const landingPage of CATALOG_LANDING_PAGES) {
    if (landingPage.categorySlug !== categorySlug) continue;
    const landingSlug = landingPage.slug.toLowerCase();
    if (productSlug.includes(landingSlug) || canonical.includes(`/${categorySlug}/${landingSlug}`)) {
      add(`/${landingPage.categorySlug}/${landingPage.slug}`);
    }
  }

  return [...paths];
}

/**
 * Инвалидирует публичные поверхности после create/update/delete товара.
 * Передавайте снимки до и после сохранения, чтобы сбросить старые и новые category/slug paths.
 */
export function revalidateProductPublicSurfaces(
  ...snapshots: Array<ProductDetail | null | undefined>
) {
  revalidatePath("/", "layout");
  revalidatePath("/catalog", "layout");
  revalidatePath("/catalog");
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/sitemap.xml");
  revalidatePath("/api/search/products");

  const paths = new Set<string>();
  for (const product of snapshots) {
    if (!product) continue;
    for (const path of collectProductSurfacePaths(product)) {
      paths.add(path);
    }
  }

  for (const path of paths) {
    revalidatePath(path, "page");
    revalidatePath(path, "layout");
  }
}
