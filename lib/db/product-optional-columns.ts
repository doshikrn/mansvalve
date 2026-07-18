import { getSql } from "@/lib/db/drizzle-core";

export type ProductOptionalColumns = {
  publicTitle: boolean;
  h1Override: boolean;
  seoTitleOverride: boolean;
  seoDescriptionOverride: boolean;
  detailBlocks: boolean;
};

let productOptionalColumnsCache: ProductOptionalColumns | null = null;

export async function getProductOptionalColumns(): Promise<ProductOptionalColumns> {
  if (productOptionalColumnsCache) return productOptionalColumnsCache;

  const sqlClient = getSql();
  const rows = await sqlClient<{ columnName: string }[]>`
    select column_name as "columnName"
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'products'
      and column_name in (
        'public_title',
        'h1_override',
        'seo_title_override',
        'seo_description_override',
        'detail_blocks'
      )
  `;
  const names = new Set(rows.map((row) => row.columnName));

  productOptionalColumnsCache = {
    publicTitle: names.has("public_title"),
    h1Override: names.has("h1_override"),
    seoTitleOverride: names.has("seo_title_override"),
    seoDescriptionOverride: names.has("seo_description_override"),
    detailBlocks: names.has("detail_blocks"),
  };

  return productOptionalColumnsCache;
}
