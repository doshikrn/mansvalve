ALTER TABLE "categories"
  ADD COLUMN IF NOT EXISTS "h1_override" text,
  ADD COLUMN IF NOT EXISTS "seo_title" text;

ALTER TABLE "subcategories"
  ADD COLUMN IF NOT EXISTS "h1_override" text,
  ADD COLUMN IF NOT EXISTS "seo_title" text;
