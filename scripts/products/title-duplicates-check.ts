/** Read-only duplicate audit for generated product browser titles. */
import { products } from "@/lib/catalog-data";
import {
  formatProductPageTitle,
  getProductSeoIdentityParts,
} from "@/lib/catalog/product-seo-naming";
import { buildPublicProductView } from "@/lib/public-catalog/product-view";
import type { PublicCatalogProduct } from "@/lib/public-catalog/types";

type AuditRow = {
  slug: string;
  url: string;
  title: string;
  fields: string;
};

const groups = new Map<string, AuditRow[]>();

for (const product of products as PublicCatalogProduct[]) {
  const view = buildPublicProductView(product);
  const title = formatProductPageTitle(view.seoTitle);
  const row: AuditRow = {
    slug: product.slug,
    url: view.canonicalPath,
    title,
    fields: getProductSeoIdentityParts(product)
      .map((part) => `${part.field}=${part.value}`)
      .join(", ") || "none",
  };
  const key = title.toLocaleLowerCase("ru-RU");
  groups.set(key, [...(groups.get(key) ?? []), row]);
}

const duplicates = [...groups.values()]
  .filter((rows) => rows.length > 1)
  .sort((a, b) => b.length - a.length);
const duplicateProducts = duplicates.reduce((sum, rows) => sum + rows.length, 0);

console.log(`Products: ${products.length}`);
console.log(`Unique titles: ${groups.size}`);
console.log(`Duplicate groups: ${duplicates.length}`);
console.log(`Products in duplicate groups: ${duplicateProducts}`);

for (const rows of duplicates) {
  console.log(`\nDUPLICATE (${rows.length}): ${rows[0].title}`);
  for (const row of rows) {
    console.log(`- ${row.url}`);
    console.log(`  slug: ${row.slug}`);
    console.log(`  generated: ${row.title}`);
    console.log(`  fields: ${row.fields}`);
  }
}

if (duplicates.length > 0) process.exitCode = 1;
