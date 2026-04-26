-- Run once against Postgres when upgrading schema (Drizzle push / manual).
-- Adds admin-managed SEO + hero fields for categories and meta for subcategories.

ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS seo_meta_description text,
  ADD COLUMN IF NOT EXISTS seo_content jsonb,
  ADD COLUMN IF NOT EXISTS hero_image_url varchar(1000);

ALTER TABLE subcategories
  ADD COLUMN IF NOT EXISTS seo_meta_description text;
