-- Slug history aliases. Old slug → product redirect target.
CREATE TABLE IF NOT EXISTS "product_slug_aliases" (
  "id" bigserial PRIMARY KEY,
  "product_id" integer NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "slug" varchar(200) NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "product_slug_aliases_slug_idx"
  ON "product_slug_aliases" ("slug");

CREATE INDEX IF NOT EXISTS "product_slug_aliases_product_idx"
  ON "product_slug_aliases" ("product_id");
