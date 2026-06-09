/**
 * Compare admin DB product vs public catalog view for a slug.
 * Read-only diagnostic — does not modify the database.
 *
 * Usage:
 *   npm run products:public-sync-check -- --slug=klapan-obratnyy-du-80
 */

import "../db/_env";

import { eq } from "drizzle-orm";

import { formatProductPageTitle } from "@/lib/catalog/product-seo-naming";
import { getDb } from "@/lib/db/drizzle-core";
import {
  categories as categoriesTable,
  products as productsTable,
  subcategories as subcategoriesTable,
} from "@/lib/db/schema";
import {
  getPublicCatalogRuntimeInfo,
  getPublicProductBySlug,
} from "@/lib/public-catalog";
import { productDetailToPublicCatalogProduct } from "@/lib/public-catalog/from-product-detail";
import { buildPublicProductView } from "@/lib/public-catalog/product-view";
import { getProductById } from "@/lib/services/products";

function readArg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const hit = process.argv.find((arg) => arg.startsWith(prefix));
  return hit ? hit.slice(prefix.length).trim() : undefined;
}

async function main() {
  const slug = readArg("slug");
  if (!slug) {
    console.error("Usage: npm run products:public-sync-check -- --slug=<product-slug>");
    process.exit(1);
  }

  const runtime = getPublicCatalogRuntimeInfo();
  console.log("Catalog runtime:", runtime);

  if (!runtime.databaseConfigured) {
    console.error("DATABASE_URL is not configured — cannot compare admin DB vs public catalog.");
    process.exit(1);
  }

  if (runtime.effectiveSource !== "db") {
    console.error(
      "CRITICAL: Public catalog effectiveSource is not db. Admin saves may not match the public site.",
    );
    process.exit(1);
  }

  const db = getDb();
  const rows = await db
    .select({
      id: productsTable.id,
      slug: productsTable.slug,
      categorySlug: categoriesTable.slug,
      subcategorySlug: subcategoriesTable.slug,
    })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(categoriesTable.id, productsTable.categoryId))
    .leftJoin(
      subcategoriesTable,
      eq(subcategoriesTable.id, productsTable.subcategoryId),
    )
    .where(eq(productsTable.slug, slug))
    .limit(1);

  if (!rows.length) {
    console.error(`Product slug "${slug}" not found in DB.`);
    process.exit(1);
  }

  const productId = rows[0].id;
  const [adminDetail, publicProduct] = await Promise.all([
    getProductById(productId),
    getPublicProductBySlug(slug),
  ]);

  if (!adminDetail) {
    console.error(`Admin product #${productId} could not be loaded.`);
    process.exit(1);
  }

  if (!publicProduct) {
    console.error(`Public catalog did not return product for slug "${slug}".`);
    process.exit(1);
  }

  const adminView = buildPublicProductView(productDetailToPublicCatalogProduct(adminDetail));
  const publicView = buildPublicProductView(publicProduct);

  const checks = [
    ["slug", adminDetail.slug, publicProduct.slug],
    ["categorySlug", adminDetail.categorySlug, publicProduct.category],
    ["subcategorySlug", adminDetail.subcategorySlug ?? "", publicProduct.subcategory],
    ["publicTitle", adminDetail.publicTitle ?? "", publicProduct.publicTitle ?? ""],
    ["h1Override", adminDetail.h1Override ?? "", publicProduct.h1Override ?? ""],
    ["h1", adminView.h1, publicView.h1],
    ["seoTitle", adminView.seoTitle, publicView.seoTitle],
    ["seoDescription", adminView.seoDescription, publicView.seoDescription],
    ["canonicalPath", adminView.canonicalPath, publicView.canonicalPath],
  ] as const;

  let failed = 0;
  for (const [label, adminValue, publicValue] of checks) {
    const pass = adminValue === publicValue;
    if (!pass) failed += 1;
    console.log(`${pass ? "OK" : "FAIL"}  ${label}`);
    if (!pass) {
      console.log(`      admin:   ${adminValue}`);
      console.log(`      public:  ${publicValue}`);
    }
  }

  console.log("\nDerived browser title (admin view):");
  console.log(`  ${formatProductPageTitle(adminView.seoTitle)}`);
  console.log("\nExpected public path:");
  console.log(`  /tovar/${slug}`);

  if (failed > 0) {
    console.error(`\n${failed} mismatch(es) between admin DB and public catalog view.`);
    process.exit(1);
  }

  console.log("\nAdmin DB and public catalog are in sync for this product.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
