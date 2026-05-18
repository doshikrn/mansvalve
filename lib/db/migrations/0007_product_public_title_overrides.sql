ALTER TABLE "products"
  ADD COLUMN IF NOT EXISTS "public_title" text;

ALTER TABLE "products"
  ADD COLUMN IF NOT EXISTS "h1_override" text;

ALTER TABLE "products"
  ADD COLUMN IF NOT EXISTS "detail_blocks" jsonb;
