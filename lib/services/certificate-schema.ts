import "server-only";

import { getSql } from "@/lib/db/client";

let certificateDocumentMediaColumnExistsCache: boolean | null = null;

export async function hasCertificateDocumentMediaColumn(): Promise<boolean> {
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
