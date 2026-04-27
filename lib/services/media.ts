import "server-only";

import { and, desc, eq, inArray, sql } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import { getStorageDriver } from "@/lib/storage";
import {
  certificates as certificatesTable,
  mediaAssets as mediaAssetsTable,
  productImages as productImagesTable,
  type MediaAsset,
  type NewMediaAsset,
} from "@/lib/db/schema";

export type MediaListOptions = {
  page?: number;
  pageSize?: number;
  onlyUnused?: boolean;
};

export type MediaAssetWithUsage = MediaAsset & {
  usedInProducts: number;
  usedInCertificates?: number;
};

export type MediaListResult = {
  items: MediaAssetWithUsage[];
  total: number;
  page: number;
  pageSize: number;
};

function isBrowserAccessibleUrl(value: string | null | undefined): boolean {
  if (!value) return false;
  const url = value.trim();
  if (!url) return false;
  return (
    url.startsWith("/") ||
    url.startsWith("//") ||
    url.startsWith("http://") ||
    url.startsWith("https://")
  );
}

/**
 * Compatibility layer for rows created with malformed base URLs in older
 * deployments. Keeps using DB url when valid, otherwise reconstructs from key.
 */
export function resolvePublicMediaUrl(
  rawUrl: string | null | undefined,
  storageKey: string,
  assetDriver?: string | null,
): string {
  const configuredDriver = (process.env.MEDIA_DRIVER || "local").toLowerCase();

  // For local driver in local mode, always derive from storage key.
  // This auto-heals rows with malformed historical `url` values.
  if (assetDriver === "local" && configuredDriver === "local") {
    return getStorageDriver().getPublicUrl(storageKey);
  }

  if (isBrowserAccessibleUrl(rawUrl)) {
    return rawUrl!.trim();
  }
  const fallback = getStorageDriver().getPublicUrl(storageKey);
  if (process.env.NODE_ENV !== "production") {
    console.warn("[media] invalid stored url, fallback to storage key", {
      rawUrl,
      storageKey,
      fallback,
    });
  }
  return fallback;
}

export async function createMediaAsset(
  payload: NewMediaAsset,
): Promise<MediaAsset> {
  const db = getDb();
  const inserted = await db
    .insert(mediaAssetsTable)
    .values(payload)
    .returning();
  if (!inserted.length) {
    throw new Error("Failed to insert media asset.");
  }
  return inserted[0];
}

export async function listMediaAssets(
  options: MediaListOptions = {},
): Promise<MediaListResult> {
  const { page = 1, pageSize = 30, onlyUnused = false } = options;
  const db = getDb();
  const offset = (Math.max(1, page) - 1) * pageSize;

  const usageCountExpr = sql<number>`count(distinct ${productImagesTable.id})::int`;
  const certUsageExpr = sql<number>`count(distinct ${certificatesTable.id})::int`;
  const base = db
    .select({
      asset: mediaAssetsTable,
      usedInProducts: usageCountExpr,
      usedInCertificates: certUsageExpr,
    })
    .from(mediaAssetsTable)
    .leftJoin(
      productImagesTable,
      eq(productImagesTable.mediaId, mediaAssetsTable.id),
    )
    .leftJoin(
      certificatesTable,
      eq(certificatesTable.mediaAssetId, mediaAssetsTable.id),
    )
    .groupBy(mediaAssetsTable.id)
    .orderBy(desc(mediaAssetsTable.createdAt))
    .limit(pageSize)
    .offset(offset);

  const rows = onlyUnused
    ? await base.having(
        and(
          sql`count(${productImagesTable.id}) = 0`,
          sql`count(${certificatesTable.id}) = 0`,
        ),
      )
    : await base;

  const countRows = await db
    .select({
      value: sql<number>`count(*)::int`,
    })
    .from(mediaAssetsTable);

  return {
    items: rows.map((row) => ({
      ...row.asset,
      url: resolvePublicMediaUrl(
        row.asset.url,
        row.asset.storageKey,
        row.asset.driver,
      ),
      usedInProducts: row.usedInProducts,
      usedInCertificates: row.usedInCertificates,
    })),
    total: countRows[0]?.value ?? 0,
    page,
    pageSize,
  };
}

export async function listRecentMediaAssets(limit = 60): Promise<MediaAssetWithUsage[]> {
  const db = getDb();

  const rows = await db
    .select({
      asset: mediaAssetsTable,
      usedInProducts: sql<number>`count(distinct ${productImagesTable.id})::int`,
      usedInCertificates: sql<number>`count(distinct ${certificatesTable.id})::int`,
    })
    .from(mediaAssetsTable)
    .leftJoin(
      productImagesTable,
      eq(productImagesTable.mediaId, mediaAssetsTable.id),
    )
    .leftJoin(
      certificatesTable,
      eq(certificatesTable.mediaAssetId, mediaAssetsTable.id),
    )
    .groupBy(mediaAssetsTable.id)
    .orderBy(desc(mediaAssetsTable.createdAt))
    .limit(limit);

  return rows.map((row) => ({
    ...row.asset,
    url: resolvePublicMediaUrl(
      row.asset.url,
      row.asset.storageKey,
      row.asset.driver,
    ),
    usedInProducts: row.usedInProducts,
    usedInCertificates: row.usedInCertificates,
  }));
}

export async function getMediaAssetsByIds(ids: string[]): Promise<MediaAsset[]> {
  if (!ids.length) return [];
  const db = getDb();
  const rows = await db
    .select()
    .from(mediaAssetsTable)
    .where(inArray(mediaAssetsTable.id, ids));
  return rows.map((row) => ({
    ...row,
    url: resolvePublicMediaUrl(row.url, row.storageKey, row.driver),
  }));
}

export async function updateMediaAlt(
  id: string,
  alt: string | null,
): Promise<void> {
  const db = getDb();
  await db
    .update(mediaAssetsTable)
    .set({ alt: alt || null })
    .where(eq(mediaAssetsTable.id, id));
}

export async function deleteMediaAssetById(id: string): Promise<void> {
  const db = getDb();
  const productUsageRows = await db
    .select({
      value: sql<number>`count(*)::int`,
    })
    .from(productImagesTable)
    .where(eq(productImagesTable.mediaId, id));
  const productUsage = productUsageRows[0]?.value ?? 0;

  if (productUsage > 0) {
    throw new Error("MEDIA_IN_USE_PRODUCT");
  }

  const certificateUsageRows = await db
    .select({
      value: sql<number>`count(*)::int`,
    })
    .from(certificatesTable)
    .where(eq(certificatesTable.mediaAssetId, id));
  const certificateUsage = certificateUsageRows[0]?.value ?? 0;

  if (certificateUsage > 0) {
    throw new Error("MEDIA_IN_USE_CERTIFICATE");
  }

  const found = await db
    .select()
    .from(mediaAssetsTable)
    .where(eq(mediaAssetsTable.id, id))
    .limit(1);

  if (!found.length) return;

  const asset = found[0];
  const driver = getStorageDriver();
  await driver.delete(asset.storageKey);
  await db.delete(mediaAssetsTable).where(eq(mediaAssetsTable.id, id));
}

export async function deleteUnusedAssetsByIds(ids: string[]): Promise<number> {
  if (!ids.length) return 0;
  const db = getDb();
  const candidates = await db
    .select({
      id: mediaAssetsTable.id,
      storageKey: mediaAssetsTable.storageKey,
    })
    .from(mediaAssetsTable)
    .where(inArray(mediaAssetsTable.id, ids));

  const removable: { id: string; storageKey: string }[] = [];
  for (const candidate of candidates) {
    const productUsageRows = await db
      .select({ value: sql<number>`count(*)::int` })
      .from(productImagesTable)
      .where(eq(productImagesTable.mediaId, candidate.id));
    const productUsage = productUsageRows[0]?.value ?? 0;

    const certificateUsageRows = await db
      .select({ value: sql<number>`count(*)::int` })
      .from(certificatesTable)
      .where(eq(certificatesTable.mediaAssetId, candidate.id));
    const certificateUsage = certificateUsageRows[0]?.value ?? 0;

    if (productUsage === 0 && certificateUsage === 0) {
      removable.push(candidate);
    }
  }

  if (!removable.length) return 0;

  const driver = getStorageDriver();
  for (const item of removable) {
    await driver.delete(item.storageKey);
  }

  await db
    .delete(mediaAssetsTable)
    .where(
      and(
        inArray(
          mediaAssetsTable.id,
          removable.map((x) => x.id),
        ),
      ),
    );

  return removable.length;
}
