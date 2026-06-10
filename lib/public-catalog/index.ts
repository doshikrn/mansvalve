import "server-only";

import { cache } from "react";

import { isDatabaseConfigured } from "@/lib/db/client";

import { dbCatalogAdapter } from "./db-adapter";
import { jsonCatalogAdapter } from "./json-adapter";
import { getPublicCatalogSource } from "./runtime-info";
import type {
  PublicCatalogAdapter,
  PublicCatalogCategory,
  PublicCatalogProduct,
  PublicCatalogSubcategory,
} from "./types";

export type {
  PublicCatalogCategory,
  PublicCatalogProduct,
  PublicCatalogSubcategory,
  PublicCatalogProductImage,
  PublicCatalogSource,
} from "./types";
export {
  buildPublicProductView,
  buildPublicProductCardView,
  type PublicProductCardView,
  type PublicProductContentSections,
  type PublicProductView,
} from "./product-view";

export { toCatalogListProduct } from "./catalog-list-product";

export type { PublicCatalogRuntimeInfo } from "./types";
export { getPublicCatalogRuntimeInfo, getPublicCatalogSource } from "./runtime-info";

function getAdapterForConfiguredSource(): PublicCatalogAdapter {
  const source = getPublicCatalogSource();
  if (source === "db" && isDatabaseConfigured()) {
    return dbCatalogAdapter;
  }
  return jsonCatalogAdapter;
}

function canRecoverDbCatalogWithJson(): boolean {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.PUBLIC_CATALOG_ALLOW_JSON_FALLBACK === "true" ||
    process.env.PUBLIC_CATALOG_RECOVERY_MODE === "json"
  );
}

async function withSafeFallback<T>(call: (adapter: PublicCatalogAdapter) => Promise<T>) {
  const source = getPublicCatalogSource();
  const databaseConfigured = isDatabaseConfigured();

  if (source === "db" && !databaseConfigured) {
    const error = new Error(
      "PUBLIC_CATALOG_SOURCE=db, but DATABASE_URL is not configured.",
    );
    console.error("[public-catalog] CRITICAL: DB catalog source is unavailable.", error);
    if (canRecoverDbCatalogWithJson()) {
      console.error("[public-catalog] Recovery mode/dev: using JSON catalog fallback.");
      return call(jsonCatalogAdapter);
    }
    throw error;
  }

  const adapter = getAdapterForConfiguredSource();
  try {
    return await call(adapter);
  } catch (error) {
    if (source === "db") {
      console.error(
        "[public-catalog] CRITICAL: DB adapter failed while PUBLIC_CATALOG_SOURCE=db.",
        error,
      );
      if (canRecoverDbCatalogWithJson()) {
        console.error("[public-catalog] Recovery mode/dev: using JSON catalog fallback.");
        return call(jsonCatalogAdapter);
      }
    }
    throw error;
  }
}

/** Per-request memo: layout + page often load the same catalog slices in parallel. */
export const getPublicCatalogCategories = cache(async function getPublicCatalogCategories(): Promise<
  PublicCatalogCategory[]
> {
  return withSafeFallback((adapter) => adapter.getCategories());
});

export const getPublicCatalogProducts = cache(async function getPublicCatalogProducts(): Promise<
  PublicCatalogProduct[]
> {
  return withSafeFallback((adapter) => adapter.getProducts());
});

/** Listing, filters, search: lighter rows (no long bodies / documents / galleries). */
export const getPublicCatalogListingProducts = cache(async function getPublicCatalogListingProducts(): Promise<
  PublicCatalogProduct[]
> {
  return withSafeFallback((adapter) => adapter.getListingProducts());
});

export const getPublicProductBySlug = cache(async function getPublicProductBySlug(
  slug: string,
): Promise<PublicCatalogProduct | undefined> {
  return withSafeFallback((adapter) => adapter.getProductBySlug(slug));
});

export const getPublicCategoryBySlug = cache(async function getPublicCategoryBySlug(
  slug: string,
): Promise<PublicCatalogCategory | undefined> {
  return withSafeFallback((adapter) => adapter.getCategoryBySlug(slug));
});

export const getPublicCategoryById = cache(async function getPublicCategoryById(
  id: string,
): Promise<PublicCatalogCategory | undefined> {
  return withSafeFallback((adapter) => adapter.getCategoryById(id));
});

export const getPublicSubcategoryBySlug = cache(async function getPublicSubcategoryBySlug(
  slug: string,
): Promise<
  | {
      category: PublicCatalogCategory;
      subcategory: PublicCatalogSubcategory;
    }
  | undefined
> {
  return withSafeFallback((adapter) => adapter.getSubcategoryBySlug(slug));
});

export const getPublicProductsByCategory = cache(async function getPublicProductsByCategory(
  categoryId: string,
): Promise<PublicCatalogProduct[]> {
  return withSafeFallback((adapter) => adapter.getProductsByCategory(categoryId));
});

export const getPublicProductsBySubcategory = cache(async function getPublicProductsBySubcategory(
  subcategoryId: string,
): Promise<PublicCatalogProduct[]> {
  return withSafeFallback((adapter) => adapter.getProductsBySubcategory(subcategoryId));
});

export const countPublicProductsByCategory = cache(async function countPublicProductsByCategory(
  categoryIdOrSlug: string,
): Promise<number> {
  return withSafeFallback((adapter) => adapter.countProductsByCategory(categoryIdOrSlug));
});

export const countPublicProductsBySubcategory = cache(async function countPublicProductsBySubcategory(
  subcategoryIdOrSlug: string,
): Promise<number> {
  return withSafeFallback((adapter) => adapter.countProductsBySubcategory(subcategoryIdOrSlug));
});
