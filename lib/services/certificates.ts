import "server-only";

import { and, asc, desc, eq, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { getDb, getSql } from "@/lib/db/client";
import {
  certificates as certificatesTable,
  mediaAssets as mediaAssetsTable,
  type NewCertificate,
} from "@/lib/db/schema";
import { resolvePublicMediaUrl } from "@/lib/services/media";

const documentMediaAssetsTable = alias(mediaAssetsTable, "document_media_assets");

type CertificateBaseRow = Omit<
  typeof certificatesTable.$inferSelect,
  "documentMediaId"
> & {
  documentMediaId: string | null;
};

const legacyCertificateSelection = {
  id: certificatesTable.id,
  title: certificatesTable.title,
  description: certificatesTable.description,
  mediaAssetId: certificatesTable.mediaAssetId,
  documentMediaId: sql<string | null>`null`,
  issuedAt: certificatesTable.issuedAt,
  sortOrder: certificatesTable.sortOrder,
  isActive: certificatesTable.isActive,
  createdAt: certificatesTable.createdAt,
  updatedAt: certificatesTable.updatedAt,
};

let certificateDocumentMediaColumnExistsCache: boolean | null = null;

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
  documentMediaAssetId: string | null;
  documentUrl: string;
  documentAlt: string | null;
  documentMimeType: string;
};

export type CertificateWritePayload = Omit<
  NewCertificate,
  "id" | "createdAt" | "updatedAt"
>;

function mapRow(
  row: {
    certificate: CertificateBaseRow;
    media: typeof mediaAssetsTable.$inferSelect;
    document: typeof mediaAssetsTable.$inferSelect | null;
  },
): CertificateListItem {
  const document = row.document ?? row.media;
  return {
    ...row.certificate,
    mediaUrl: resolvePublicMediaUrl(
      row.media.url,
      row.media.storageKey,
      row.media.driver,
    ),
    mediaAlt: row.media.alt,
    mediaMimeType: row.media.mimeType,
    documentMediaAssetId: row.certificate.documentMediaId,
    documentUrl: resolvePublicMediaUrl(
      document.url,
      document.storageKey,
      document.driver,
    ),
    documentAlt: document.alt,
    documentMimeType: document.mimeType,
  };
}

export async function listPublicActiveCertificates(): Promise<CertificateListItem[]> {
  if (!(await hasCertificateDocumentMediaColumn())) {
    return listPublicActiveCertificatesLegacy();
  }

  const db = getDb();
  const rows = await db
    .select({
      certificate: certificatesTable,
      media: mediaAssetsTable,
      document: documentMediaAssetsTable,
    })
    .from(certificatesTable)
    .innerJoin(mediaAssetsTable, eq(mediaAssetsTable.id, certificatesTable.mediaAssetId))
    .leftJoin(
      documentMediaAssetsTable,
      eq(documentMediaAssetsTable.id, certificatesTable.documentMediaId),
    )
    .where(eq(certificatesTable.isActive, true))
    .orderBy(
      asc(certificatesTable.sortOrder),
      desc(certificatesTable.issuedAt),
      desc(certificatesTable.id),
    );

  return rows.map((row) =>
    mapRow({
      certificate: row.certificate,
      media: row.media,
      document: normalizeDocumentRow(row.document),
    }),
  );
}

export async function listAdminCertificates(): Promise<CertificateListItem[]> {
  if (!(await hasCertificateDocumentMediaColumn())) {
    return listAdminCertificatesLegacy();
  }

  const db = getDb();
  const rows = await db
    .select({
      certificate: certificatesTable,
      media: mediaAssetsTable,
      document: documentMediaAssetsTable,
    })
    .from(certificatesTable)
    .innerJoin(mediaAssetsTable, eq(mediaAssetsTable.id, certificatesTable.mediaAssetId))
    .leftJoin(
      documentMediaAssetsTable,
      eq(documentMediaAssetsTable.id, certificatesTable.documentMediaId),
    )
    .orderBy(
      asc(certificatesTable.sortOrder),
      desc(certificatesTable.updatedAt),
      desc(certificatesTable.id),
    );

  return rows.map((row) =>
    mapRow({
      certificate: row.certificate,
      media: row.media,
      document: normalizeDocumentRow(row.document),
    }),
  );
}

export async function getCertificateById(
  id: number,
): Promise<CertificateListItem | null> {
  if (!(await hasCertificateDocumentMediaColumn())) {
    return getCertificateByIdLegacy(id);
  }

  const db = getDb();
  const rows = await db
    .select({
      certificate: certificatesTable,
      media: mediaAssetsTable,
      document: documentMediaAssetsTable,
    })
    .from(certificatesTable)
    .innerJoin(mediaAssetsTable, eq(mediaAssetsTable.id, certificatesTable.mediaAssetId))
    .leftJoin(
      documentMediaAssetsTable,
      eq(documentMediaAssetsTable.id, certificatesTable.documentMediaId),
    )
    .where(eq(certificatesTable.id, id))
    .limit(1);

  if (!rows.length) return null;
  return mapRow({
    certificate: rows[0].certificate,
    media: rows[0].media,
    document: normalizeDocumentRow(rows[0].document),
  });
}

function normalizeDocumentRow(
  document: typeof mediaAssetsTable.$inferSelect | null,
): typeof mediaAssetsTable.$inferSelect | null {
  if (!document) {
    return null;
  }
  return document;
}

export async function createCertificate(payload: CertificateWritePayload): Promise<number> {
  const db = getDb();
  const writablePayload = await toWritableCertificatePayload(payload);
  const inserted = await db
    .insert(certificatesTable)
    .values({
      ...writablePayload,
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
  const writablePayload = await toWritableCertificatePayload(payload);
  await db
    .update(certificatesTable)
    .set({
      ...writablePayload,
      updatedAt: new Date(),
    })
    .where(eq(certificatesTable.id, id));
}

async function listPublicActiveCertificatesLegacy(): Promise<CertificateListItem[]> {
  const db = getDb();
  const rows = await db
    .select({
      certificate: legacyCertificateSelection,
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

  return rows.map((row) =>
    mapRow({
      certificate: row.certificate,
      media: row.media,
      document: null,
    }),
  );
}

async function listAdminCertificatesLegacy(): Promise<CertificateListItem[]> {
  const db = getDb();
  const rows = await db
    .select({
      certificate: legacyCertificateSelection,
      media: mediaAssetsTable,
    })
    .from(certificatesTable)
    .innerJoin(mediaAssetsTable, eq(mediaAssetsTable.id, certificatesTable.mediaAssetId))
    .orderBy(
      asc(certificatesTable.sortOrder),
      desc(certificatesTable.updatedAt),
      desc(certificatesTable.id),
    );

  return rows.map((row) =>
    mapRow({
      certificate: row.certificate,
      media: row.media,
      document: null,
    }),
  );
}

async function getCertificateByIdLegacy(
  id: number,
): Promise<CertificateListItem | null> {
  const db = getDb();
  const rows = await db
    .select({
      certificate: legacyCertificateSelection,
      media: mediaAssetsTable,
    })
    .from(certificatesTable)
    .innerJoin(mediaAssetsTable, eq(mediaAssetsTable.id, certificatesTable.mediaAssetId))
    .where(eq(certificatesTable.id, id))
    .limit(1);

  if (!rows.length) return null;
  return mapRow({
    certificate: rows[0].certificate,
    media: rows[0].media,
    document: null,
  });
}

async function hasCertificateDocumentMediaColumn(): Promise<boolean> {
  if (certificateDocumentMediaColumnExistsCache !== null) {
    return certificateDocumentMediaColumnExistsCache;
  }

  const sqlClient = getSql();
  const rows = await sqlClient<{ exists: boolean }[]>`
    select exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'certificates'
        and column_name = 'document_media_id'
    ) as "exists"
  `;
  certificateDocumentMediaColumnExistsCache = rows[0]?.exists ?? false;
  return certificateDocumentMediaColumnExistsCache;
}

async function toWritableCertificatePayload(
  payload: CertificateWritePayload,
): Promise<CertificateWritePayload | Omit<CertificateWritePayload, "documentMediaId">> {
  if (await hasCertificateDocumentMediaColumn()) {
    return payload;
  }

  const legacyPayload = { ...payload };
  delete legacyPayload.documentMediaId;
  return legacyPayload;
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
