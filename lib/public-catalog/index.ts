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

function getAdapterForConfiguredSource(): PublicCatalogAdapter {
  const source = getPublicCatalogSource();
  if (source === "db" && isDatabaseConfigured()) {
    return dbCatalogAdapter;
  }
  return jsonCatalogAdapter;
}

async function withSafeFallback<T>(call: (adapter: PublicCatalogAdapter) => Promise<T>) {
  const source = getPublicCatalogSource();
  const adapter = getAdapterForConfiguredSource();
  try {
    return await call(adapter);
  } catch (error) {
    if (source === "db") {
      console.error(
        "[public-catalog] DB adapter failed, falling back to JSON source.",
        error,
      );
      return call(jsonCatalogAdapter);
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
