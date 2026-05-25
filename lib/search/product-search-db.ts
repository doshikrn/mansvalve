import "server-only";

import { and, asc, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";

import { getDb } from "@/lib/db/drizzle-core";
import {
  categories as categoriesTable,
  mediaAssets as mediaAssetsTable,
  productImages as productImagesTable,
  products as productsTable,
  subcategories as subcategoriesTable,
} from "@/lib/db/schema";
import { resolvePublicMediaUrl } from "@/lib/services/media";
import type { PublicCatalogProduct } from "@/lib/public-catalog/types";

const TRGM_SIMILARITY_THRESHOLD = 0.12;

let pgTrgmAvailable: boolean | null = null;

function escapeIlikePattern(raw: string): string {
  return raw.replace(/[%_\\]/g, "\\$&");
}

async function isPgTrgmEnabled(): Promise<boolean> {
  if (pgTrgmAvailable !== null) return pgTrgmAvailable;
  try {
    const db = getDb();
    const result = await db.execute(
      sql`SELECT 1 AS ok FROM pg_extension WHERE extname = 'pg_trgm' LIMIT 1`,
    );
    pgTrgmAvailable = result.length > 0;
  } catch {
    pgTrgmAvailable = false;
  }
  return pgTrgmAvailable;
}

type SearchListingRow = {
  product: {
    id: number;
    slug: string;
    name: string;
    publicTitle: string | null;
    h1Override: string | null;
    categoryName: string;
    subcategoryName: string | null;
    dn: number | null;
    pn: number | null;
    thread: string | null;
    material: string | null;
    connectionType: string | null;
    controlType: string | null;
    model: string | null;
    price: (typeof productsTable.$inferSelect)["price"];
    priceByRequest: boolean;
    weight: (typeof productsTable.$inferSelect)["weight"];
    shortDescription: string | null;
    sortOrder: number;
  };
  category: { slug: string; name: string };
  subcategory: { slug: string; name: string } | null;
};

async function fetchPrimaryImageMap(
  productIds: number[],
): Promise<Map<number, { url: string; alt: string }>> {
  const map = new Map<number, { url: string; alt: string }>();
  if (!productIds.length) return map;

  const db = getDb();
  const rows = await db
    .select({
      productId: productImagesTable.productId,
      url: mediaAssetsTable.url,
      storageKey: mediaAssetsTable.storageKey,
      driver: mediaAssetsTable.driver,
      imageAlt: productImagesTable.alt,
      assetAlt: mediaAssetsTable.alt,
      isPrimary: productImagesTable.isPrimary,
      sortOrder: productImagesTable.sortOrder,
      id: productImagesTable.id,
    })
    .from(productImagesTable)
    .innerJoin(mediaAssetsTable, eq(mediaAssetsTable.id, productImagesTable.mediaId))
    .where(inArray(productImagesTable.productId, productIds))
    .orderBy(
      asc(productImagesTable.productId),
      desc(productImagesTable.isPrimary),
      asc(productImagesTable.sortOrder),
      asc(productImagesTable.id),
    );

  for (const row of rows) {
    if (!map.has(row.productId)) {
      map.set(row.productId, {
        url: resolvePublicMediaUrl(row.url, row.storageKey, row.driver),
        alt: row.imageAlt || row.assetAlt || "",
      });
    }
  }

  return map;
}

function toNumber(value: string | number | null): number | undefined {
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function mapSearchRowToProduct(
  row: SearchListingRow,
  primaryImage: { url: string; alt: string } | undefined,
): PublicCatalogProduct {
  const product = row.product;
  const category = row.category;
  const subcategory = row.subcategory;
  return {
    id: String(product.id),
    name: product.name,
    publicTitle: product.publicTitle ?? undefined,
    h1Override: product.h1Override ?? undefined,
    slug: product.slug,
    category: category.slug,
    subcategory: subcategory?.slug ?? "",
    subcategoryName: subcategory?.name ?? product.subcategoryName ?? "",
    categoryName: category.name,
    dn: product.dn ?? undefined,
    pn: product.pn ?? undefined,
    thread: product.thread ?? undefined,
    material: product.material || "Не указан",
    connectionType: product.connectionType || "Не указано",
    controlType: product.controlType || "Не указано",
    model: product.model || "",
    price: toNumber(product.price),
    priceByRequest: product.priceByRequest || product.price == null,
    weight: toNumber(product.weight),
    specs: {},
    shortDescription: product.shortDescription || "",
    longDescription: undefined,
    detailBlocks: undefined,
    primaryImageUrl: primaryImage?.url,
    primaryImageAlt: primaryImage?.alt || undefined,
    documents: undefined,
    images: undefined,
  };
}

function buildTextMatchWhere(pattern: string, qLower: string, useTrgm: boolean, rawQ: string) {
  const slugExact = sql`lower(${productsTable.slug}) = ${qLower}`;
  const ilikeMatches = or(
    ilike(productsTable.name, pattern),
    ilike(productsTable.model, pattern),
    ilike(productsTable.material, pattern),
  );

  if (!useTrgm) {
    return or(slugExact, ilikeMatches);
  }

  const trgmMatches = or(
    sql`similarity(${productsTable.name}, ${rawQ}) > ${TRGM_SIMILARITY_THRESHOLD}`,
    sql`similarity(coalesce(${productsTable.model}, ''), ${rawQ}) > ${TRGM_SIMILARITY_THRESHOLD}`,
    sql`similarity(coalesce(${productsTable.material}, ''), ${rawQ}) > ${TRGM_SIMILARITY_THRESHOLD}`,
  );

  return or(slugExact, trgmMatches, ilikeMatches);
}

function buildSearchOrder(qLower: string, rawQ: string, useTrgm: boolean) {
  const slugRank = sql`CASE WHEN lower(${productsTable.slug}) = ${qLower} THEN 0 ELSE 1 END`;
  if (!useTrgm) {
    return [slugRank, asc(productsTable.sortOrder), asc(productsTable.name)];
  }
  const trgmRank = sql`greatest(
    similarity(${productsTable.name}, ${rawQ}),
    similarity(coalesce(${productsTable.model}, ''), ${rawQ}),
    similarity(coalesce(${productsTable.material}, ''), ${rawQ})
  ) DESC`;
  return [slugRank, trgmRank, asc(productsTable.sortOrder), asc(productsTable.name)];
}

/**
 * Header/autocomplete search — SQL path only (no full-catalog load, no specs/gallery).
 */
export async function searchProductsInDatabase(
  rawQ: string,
  limit: number,
): Promise<PublicCatalogProduct[]> {
  const q = rawQ.trim();
  if (!q) return [];

  const db = getDb();
  const qLower = q.toLowerCase();
  const pattern = `%${escapeIlikePattern(q)}%`;
  const useTrgm = await isPgTrgmEnabled();

  const rows = (await db
    .select({
      product: {
        id: productsTable.id,
        slug: productsTable.slug,
        name: productsTable.name,
        publicTitle: productsTable.publicTitle,
        h1Override: productsTable.h1Override,
        categoryName: productsTable.categoryName,
        subcategoryName: productsTable.subcategoryName,
        dn: productsTable.dn,
        pn: productsTable.pn,
        thread: productsTable.thread,
        material: productsTable.material,
        connectionType: productsTable.connectionType,
        controlType: productsTable.controlType,
        model: productsTable.model,
        price: productsTable.price,
        priceByRequest: productsTable.priceByRequest,
        weight: productsTable.weight,
        shortDescription: productsTable.shortDescription,
        sortOrder: productsTable.sortOrder,
      },
      category: {
        slug: categoriesTable.slug,
        name: categoriesTable.name,
      },
      subcategory: {
        slug: subcategoriesTable.slug,
        name: subcategoriesTable.name,
      },
    })
    .from(productsTable)
    .innerJoin(categoriesTable, eq(categoriesTable.id, productsTable.categoryId))
    .leftJoin(subcategoriesTable, eq(subcategoriesTable.id, productsTable.subcategoryId))
    .where(
      and(
        eq(productsTable.isActive, true),
        eq(categoriesTable.isActive, true),
        buildTextMatchWhere(pattern, qLower, useTrgm, q),
      ),
    )
    .orderBy(...buildSearchOrder(qLower, q, useTrgm))
    .limit(limit)) as SearchListingRow[];

  const primaryImageMap = await fetchPrimaryImageMap(rows.map((row) => row.product.id));
  return rows.map((row) =>
    mapSearchRowToProduct(row, primaryImageMap.get(row.product.id)),
  );
}
