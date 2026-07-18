ALTER TABLE "products"
  ADD COLUMN IF NOT EXISTS "seo_title_override" text,
  ADD COLUMN IF NOT EXISTS "seo_description_override" text;
