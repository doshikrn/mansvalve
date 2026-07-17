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
const violations: Array<{ slug: string; title: string; reason: string }> = [];

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

  if (title.toLocaleLowerCase("ru-RU").includes("купить в казахстане")) {
    violations.push({ slug: product.slug, title, reason: "auto title contains forbidden phrase" });
  }
  if (title.split("MANSVALVE GROUP").length - 1 !== 1) {
    violations.push({ slug: product.slug, title, reason: "brand count is not exactly one" });
  }
  if (title.includes("...") || title.includes("…")) {
    violations.push({ slug: product.slug, title, reason: "title contains artificial ellipsis" });
  }
  if (/series:/iu.test(title)) {
    violations.push({ slug: product.slug, title, reason: "title contains technical series id" });
  }
  if (/арт\.\s+(?:\d+|[0-9a-f]{8}-[0-9a-f-]{27,})\b/iu.test(title)) {
    violations.push({ slug: product.slug, title, reason: "title contains a DB/UUID identifier" });
  }
  if ((title.match(/Страница\s+\d+/giu) ?? []).length > 1) {
    violations.push({ slug: product.slug, title, reason: "page suffix is duplicated" });
  }
}

const duplicates = [...groups.values()]
  .filter((rows) => rows.length > 1)
  .sort((a, b) => b.length - a.length);
const duplicateProducts = duplicates.reduce((sum, rows) => sum + rows.length, 0);

console.log(`Products: ${products.length}`);
console.log(`Unique titles: ${groups.size}`);
console.log(`Duplicate groups: ${duplicates.length}`);
console.log(`Products in duplicate groups: ${duplicateProducts}`);
console.log(`SEO mask violations: ${violations.length}`);

for (const rows of duplicates) {
  console.log(`\nDUPLICATE (${rows.length}): ${rows[0].title}`);
  for (const row of rows) {
    console.log(`- ${row.url}`);
    console.log(`  slug: ${row.slug}`);
    console.log(`  generated: ${row.title}`);
    console.log(`  fields: ${row.fields}`);
  }
}

for (const violation of violations) {
  console.log(`\nVIOLATION: ${violation.reason}`);
  console.log(`- ${violation.slug}`);
  console.log(`  ${violation.title}`);
}

if (duplicates.length > 0 || violations.length > 0) process.exitCode = 1;
