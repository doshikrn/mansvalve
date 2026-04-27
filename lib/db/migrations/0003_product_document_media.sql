ALTER TABLE "products"
  ADD COLUMN IF NOT EXISTS "specification_media_id" uuid,
  ADD COLUMN IF NOT EXISTS "questionnaire_media_id" uuid,
  ADD COLUMN IF NOT EXISTS "documentation_media_id" uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'products_specification_media_id_media_assets_id_fk'
  ) THEN
    ALTER TABLE "products"
      ADD CONSTRAINT "products_specification_media_id_media_assets_id_fk"
      FOREIGN KEY ("specification_media_id")
      REFERENCES "media_assets"("id")
      ON DELETE RESTRICT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'products_questionnaire_media_id_media_assets_id_fk'
  ) THEN
    ALTER TABLE "products"
      ADD CONSTRAINT "products_questionnaire_media_id_media_assets_id_fk"
      FOREIGN KEY ("questionnaire_media_id")
      REFERENCES "media_assets"("id")
      ON DELETE RESTRICT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'products_documentation_media_id_media_assets_id_fk'
  ) THEN
    ALTER TABLE "products"
      ADD CONSTRAINT "products_documentation_media_id_media_assets_id_fk"
      FOREIGN KEY ("documentation_media_id")
      REFERENCES "media_assets"("id")
      ON DELETE RESTRICT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "products_spec_media_idx" ON "products" ("specification_media_id");
CREATE INDEX IF NOT EXISTS "products_questionnaire_media_idx" ON "products" ("questionnaire_media_id");
CREATE INDEX IF NOT EXISTS "products_documentation_media_idx" ON "products" ("documentation_media_id");
