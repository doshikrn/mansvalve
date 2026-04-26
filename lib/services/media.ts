import "server-only";

import { and, desc, eq, inArray, sql } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import { getStorageDriver } from "@/lib/storage";
import {
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
};

export type MediaListResult = {
  items: MediaAssetWithUsage[];
  total: number;
  page: number;
  pageSize: number;
};

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

  const usageCountExpr = sql<number>`count(${productImagesTable.id})::int`;
  const base = db
    .select({
      asset: mediaAssetsTable,
      usedInProducts: usageCountExpr,
    })
    .from(mediaAssetsTable)
    .leftJoin(
      productImagesTable,
      eq(productImagesTable.mediaId, mediaAssetsTable.id),
    )
    .groupBy(mediaAssetsTable.id)
    .orderBy(desc(mediaAssetsTable.createdAt))
    .limit(pageSize)
    .offset(offset);

  const rows = onlyUnused
    ? await base.having(sql`count(${productImagesTable.id}) = 0`)
    : await base;

  const countRows = await db
    .select({
      value: sql<number>`count(*)::int`,
    })
    .from(mediaAssetsTable);

  return {
    items: rows.map((row) => ({ ...row.asset, usedInProducts: row.usedInProducts })),
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
      usedInProducts: sql<number>`count(${productImagesTable.id})::int`,
    })
    .from(mediaAssetsTable)
    .leftJoin(
      productImagesTable,
      eq(productImagesTable.mediaId, mediaAssetsTable.id),
    )
    .groupBy(mediaAssetsTable.id)
    .orderBy(desc(mediaAssetsTable.createdAt))
    .limit(limit);

  return rows.map((row) => ({
    ...row.asset,
    usedInProducts: row.usedInProducts,
  }));
}

export async function getMediaAssetsByIds(ids: string[]): Promise<MediaAsset[]> {
  if (!ids.length) return [];
  const db = getDb();
  return db
    .select()
    .from(mediaAssetsTable)
    .where(inArray(mediaAssetsTable.id, ids));
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
  const usageRows = await db
    .select({
      value: sql<number>`count(*)::int`,
    })
    .from(productImagesTable)
    .where(eq(productImagesTable.mediaId, id));
  const usage = usageRows[0]?.value ?? 0;

  if (usage > 0) {
    throw new Error("MEDIA_IN_USE");
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
    const usage = await db
      .select({ value: sql<number>`count(*)::int` })
      .from(productImagesTable)
      .where(eq(productImagesTable.mediaId, candidate.id));
    if ((usage[0]?.value ?? 0) === 0) {
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
