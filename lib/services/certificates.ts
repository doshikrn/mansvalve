import "server-only";

import { and, asc, desc, eq, sql } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import {
  certificates as certificatesTable,
  mediaAssets as mediaAssetsTable,
  type NewCertificate,
} from "@/lib/db/schema";
import { resolvePublicMediaUrl } from "@/lib/services/media";

export type CertificateListItem = {
  id: number;
  title: string;
  description: string | null;
  mediaAssetId: string;
  issuedAt: Date | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  mediaUrl: string;
  mediaAlt: string | null;
  mediaMimeType: string;
};

export type CertificateWritePayload = Omit<
  NewCertificate,
  "id" | "createdAt" | "updatedAt"
>;

function mapRow(
  row: {
    certificate: typeof certificatesTable.$inferSelect;
    media: typeof mediaAssetsTable.$inferSelect;
  },
): CertificateListItem {
  return {
    ...row.certificate,
    mediaUrl: resolvePublicMediaUrl(
      row.media.url,
      row.media.storageKey,
      row.media.driver,
    ),
    mediaAlt: row.media.alt,
    mediaMimeType: row.media.mimeType,
  };
}

export async function listPublicActiveCertificates(): Promise<CertificateListItem[]> {
  const db = getDb();
  const rows = await db
    .select({
      certificate: certificatesTable,
      media: mediaAssetsTable,
    })
    .from(certificatesTable)
    .innerJoin(mediaAssetsTable, eq(mediaAssetsTable.id, certificatesTable.mediaAssetId))
    .where(eq(certificatesTable.isActive, true))
    .orderBy(
      asc(certificatesTable.sortOrder),
      desc(certificatesTable.issuedAt),
      desc(certificatesTable.id),
    );

  return rows.map(mapRow);
}

export async function listAdminCertificates(): Promise<CertificateListItem[]> {
  const db = getDb();
  const rows = await db
    .select({
      certificate: certificatesTable,
      media: mediaAssetsTable,
    })
    .from(certificatesTable)
    .innerJoin(mediaAssetsTable, eq(mediaAssetsTable.id, certificatesTable.mediaAssetId))
    .orderBy(
      asc(certificatesTable.sortOrder),
      desc(certificatesTable.updatedAt),
      desc(certificatesTable.id),
    );

  return rows.map(mapRow);
}

export async function getCertificateById(
  id: number,
): Promise<CertificateListItem | null> {
  const db = getDb();
  const rows = await db
    .select({
      certificate: certificatesTable,
      media: mediaAssetsTable,
    })
    .from(certificatesTable)
    .innerJoin(mediaAssetsTable, eq(mediaAssetsTable.id, certificatesTable.mediaAssetId))
    .where(eq(certificatesTable.id, id))
    .limit(1);

  if (!rows.length) return null;
  return mapRow(rows[0]);
}

export async function createCertificate(payload: CertificateWritePayload): Promise<number> {
  const db = getDb();
  const inserted = await db
    .insert(certificatesTable)
    .values({
      ...payload,
      updatedAt: new Date(),
    })
    .returning({ id: certificatesTable.id });
  if (!inserted.length) {
    throw new Error("Failed to create certificate.");
  }
  return inserted[0].id;
}

export async function updateCertificate(
  id: number,
  payload: CertificateWritePayload,
): Promise<void> {
  const db = getDb();
  await db
    .update(certificatesTable)
    .set({
      ...payload,
      updatedAt: new Date(),
    })
    .where(eq(certificatesTable.id, id));
}

export async function deleteCertificate(id: number): Promise<void> {
  const db = getDb();
  await db.delete(certificatesTable).where(eq(certificatesTable.id, id));
}

export async function countActiveCertificates(): Promise<number> {
  const db = getDb();
  const rows = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(certificatesTable)
    .where(and(eq(certificatesTable.isActive, true)));
  return rows[0]?.value ?? 0;
}
