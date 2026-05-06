ALTER TABLE "certificates"
  ADD COLUMN IF NOT EXISTS "document_media_id" uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'certificates_document_media_id_media_assets_id_fk'
  ) THEN
    ALTER TABLE "certificates"
      ADD CONSTRAINT "certificates_document_media_id_media_assets_id_fk"
      FOREIGN KEY ("document_media_id")
      REFERENCES "media_assets"("id")
      ON DELETE RESTRICT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "certificates_document_media_idx"
  ON "certificates" ("document_media_id");
