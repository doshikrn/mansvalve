import "server-only";

import { isDatabaseConfigured } from "@/lib/db/client";

import { dbCatalogAdapter } from "./db-adapter";
import { jsonCatalogAdapter } from "./json-adapter";
import type {
  PublicCatalogAdapter,
  PublicCatalogCategory,
  PublicCatalogProduct,
  PublicCatalogSource,
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
  type PublicProductContentSections,
  type PublicProductView,
} from "./product-view";

export function getPublicCatalogSource(): PublicCatalogSource {
  const explicit = process.env.PUBLIC_CATALOG_SOURCE?.trim().toLowerCase();
  if (explicit === "json" || explicit === "db") {
    return explicit;
  }

  // Backward compatibility with the old boolean switch used in the previous slice.
  if (process.env.PUBLIC_CATALOG_FROM_DB === "true") {
    return "db";
  }

  return "json";
}

export type PublicCatalogRuntimeInfo = {
  configuredSource: PublicCatalogSource;
  effectiveSource: PublicCatalogSource;
  databaseConfigured: boolean;
  adminChangesVisibleOnPublicSite: boolean;
};

export function getPublicCatalogRuntimeInfo(): PublicCatalogRuntimeInfo {
  const configuredSource = getPublicCatalogSource();
  const databaseConfigured = isDatabaseConfigured();
  const effectiveSource =
    configuredSource === "db" && databaseConfigured ? "db" : "json";

  return {
    configuredSource,
    effectiveSource,
    databaseConfigured,
    adminChangesVisibleOnPublicSite: effectiveSource === "db",
  };
}

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

export async function getPublicCatalogCategories(): Promise<PublicCatalogCategory[]> {
  return withSafeFallback((adapter) => adapter.getCategories());
}

export async function getPublicCatalogProducts(): Promise<PublicCatalogProduct[]> {
  return withSafeFallback((adapter) => adapter.getProducts());
}

export async function getPublicProductBySlug(
  slug: string,
): Promise<PublicCatalogProduct | undefined> {
  return withSafeFallback((adapter) => adapter.getProductBySlug(slug));
}

export async function getPublicCategoryBySlug(
  slug: string,
): Promise<PublicCatalogCategory | undefined> {
  return withSafeFallback((adapter) => adapter.getCategoryBySlug(slug));
}

export async function getPublicCategoryById(
  id: string,
): Promise<PublicCatalogCategory | undefined> {
  return withSafeFallback((adapter) => adapter.getCategoryById(id));
}

export async function getPublicSubcategoryBySlug(
  slug: string,
): Promise<
  | {
      category: PublicCatalogCategory;
      subcategory: PublicCatalogSubcategory;
    }
  | undefined
> {
  return withSafeFallback((adapter) => adapter.getSubcategoryBySlug(slug));
}

export async function getPublicProductsByCategory(
  categoryId: string,
): Promise<PublicCatalogProduct[]> {
  return withSafeFallback((adapter) => adapter.getProductsByCategory(categoryId));
}

export async function getPublicProductsBySubcategory(
  subcategoryId: string,
): Promise<PublicCatalogProduct[]> {
  return withSafeFallback((adapter) => adapter.getProductsBySubcategory(subcategoryId));
}
