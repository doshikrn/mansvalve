/**
 * Validates known legacy subcategory redirect targets against the JSON catalog.
 *
 * Usage: npm run catalog:legacy-redirect-check
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  catalogCategoryPath,
  catalogSubcategoryListingHref,
  catalogSubcategoryPath,
} from "@/lib/catalog-routes";
import { listLegacySubcategoryRedirectEntries } from "@/lib/catalog-subcategory-legacy-redirects";
import { LEGACY_INTERNAL_LINK_HREFS } from "@/lib/legacy-internal-link-hrefs";

type CatalogJson = {
  categories: Array<{
    slug: string;
    subcategories: Array<{ slug: string }>;
  }>;
};

const catalogPath = join(process.cwd(), "data", "catalog-products.json");
const catalog = JSON.parse(readFileSync(catalogPath, "utf8")) as CatalogJson;

const validPaths = new Set<string>();
for (const category of catalog.categories) {
  validPaths.add(catalogCategoryPath(category.slug));
  for (const subcategory of category.subcategories) {
    validPaths.add(catalogSubcategoryPath(category.slug, subcategory.slug));
    validPaths.add(catalogSubcategoryListingHref(category.slug, subcategory.slug));
  }
}

const entries = [
  ...listLegacySubcategoryRedirectEntries(),
  ...Object.entries(LEGACY_INTERNAL_LINK_HREFS).map(([source, target]) => ({ source, target })),
];
const failures: string[] = [];

for (const { source, target } of entries) {
  if (!validPaths.has(target)) {
    failures.push(`${source} → ${target} (target missing in catalog)`);
  }
}

const mustRedirects = [
  {
    source: "/catalog/zadvizhki/chugunnye-flantsevye-zadvizhki",
    target: catalogSubcategoryListingHref("zadvizhki", "zadvizhki-chugunnye"),
  },
  {
    source: "/catalog/klapany/podemnye",
    target: "/catalog/klapany-obratnye",
  },
];

for (const { source, target } of mustRedirects) {
  const found = entries.find((e) => e.source === source);
  if (!found || found.target !== target) {
    failures.push(`${source} must redirect to ${target}`);
  }
}

if (failures.length > 0) {
  console.error("Legacy redirect check failed:\n");
  for (const line of failures) console.error(`  - ${line}`);
  process.exit(1);
}

console.log(`Legacy redirect check passed (${entries.length} mappings).`);
