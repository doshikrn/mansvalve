-- Adds editable product detail list blocks used on public product pages.
-- Run on production after deploy:
--   psql "$DATABASE_URL" -f scripts/db/add-product-detail-blocks.sql

alter table products
  add column if not exists detail_blocks jsonb;
