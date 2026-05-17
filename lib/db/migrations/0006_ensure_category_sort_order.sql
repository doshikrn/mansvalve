ALTER TABLE "categories"
  ADD COLUMN IF NOT EXISTS "sort_order" integer NOT NULL DEFAULT 0;

ALTER TABLE "subcategories"
  ADD COLUMN IF NOT EXISTS "sort_order" integer NOT NULL DEFAULT 0;
