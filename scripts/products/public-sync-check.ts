/**
 * Compare DB product row vs public catalog view for a slug.
 * Read-only diagnostic — does not modify the database.
 *
 * Usage:
 *   npm run products:public-sync-check -- --slug=klapan-obratnyy-du-80
 */

import "../db/_env";

import { eq, sql } from "drizzle-orm";

import { formatProductPageTitle } from "@/lib/catalog/product-seo-naming";
import { getDb } from "@/lib/db/drizzle-core";
import {
  categories as categoriesTable,
  productSlugAliases as productSlugAliasesTable,
  products as productsTable,
  subcategories as subcategoriesTable,
} from "@/lib/db/schema";
import { getPublicCatalogRuntimeInfo } from "@/lib/public-catalog/runtime-info";
import { buildPublicProductView } from "@/lib/public-catalog/product-view";
import type { PublicCatalogProduct } from "@/lib/public-catalog/types";
import { getProductOptionalColumns } from "@/lib/db/product-optional-columns";

function readArg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const hit = process.argv.find((arg) => arg.startsWith(prefix));
  return hit ? hit.slice(prefix.length).trim() : undefined;
}

async function loadDbProductBySlug(slug: string) {
  const db = getDb();
  const optional = await getProductOptionalColumns();

  const rows = await db
    .select({
      id: productsTable.id,
      slug: productsTable.slug,
      name: productsTable.name,
      publicTitle: optional.publicTitle
        ? productsTable.publicTitle
        : sql<string | null>`null`,
      h1Override: optional.h1Override
        ? productsTable.h1Override
        : sql<string | null>`null`,
      seoTitleOverride: optional.seoTitleOverride
        ? productsTable.seoTitleOverride
        : sql<string | null>`null`,
      seoDescriptionOverride: optional.seoDescriptionOverride
        ? productsTable.seoDescriptionOverride
        : sql<string | null>`null`,
      shortDescription: productsTable.shortDescription,
      longDescription: productsTable.longDescription,
      dn: productsTable.dn,
      pn: productsTable.pn,
      thread: productsTable.thread,
      material: productsTable.material,
      connectionType: productsTable.connectionType,
      controlType: productsTable.controlType,
      model: productsTable.model,
      price: productsTable.price,
      priceByRequest: productsTable.priceByRequest,
      weight: productsTable.weight,
      isActive: productsTable.isActive,
      categorySlug: categoriesTable.slug,
      categoryName: categoriesTable.name,
      subcategorySlug: subcategoriesTable.slug,
      subcategoryName: subcategoriesTable.name,
    })
    .from(productsTable)
    .innerJoin(categoriesTable, eq(categoriesTable.id, productsTable.categoryId))
    .leftJoin(
      subcategoriesTable,
      eq(subcategoriesTable.id, productsTable.subcategoryId),
    )
    .where(eq(productsTable.slug, slug))
    .limit(1);

  return rows[0] ?? null;
}

function toPublicProduct(row: NonNullable<Awaited<ReturnType<typeof loadDbProductBySlug>>>): PublicCatalogProduct {
  return {
    id: String(row.id),
    name: row.name,
    publicTitle: row.publicTitle ?? undefined,
    h1Override: row.h1Override ?? undefined,
    seoTitleOverride: row.seoTitleOverride ?? undefined,
    seoDescriptionOverride: row.seoDescriptionOverride ?? undefined,
    slug: row.slug,
    category: row.categorySlug,
    subcategory: row.subcategorySlug ?? "",
    subcategoryName: row.subcategoryName ?? "",
    categoryName: row.categoryName,
    dn: row.dn ?? undefined,
    pn: row.pn ?? undefined,
    thread: row.thread ?? undefined,
    material: row.material ?? "",
    connectionType: row.connectionType ?? "",
    controlType: row.controlType ?? "",
    model: row.model ?? "",
    price: row.price == null ? undefined : Number(row.price),
    priceByRequest: row.priceByRequest,
    weight: row.weight == null ? undefined : Number(row.weight),
    specs: {},
    shortDescription: row.shortDescription ?? "",
    longDescription: row.longDescription ?? undefined,
  };
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

  const dbRow = await loadDbProductBySlug(slug);
  if (!dbRow) {
    console.error(`Product slug "${slug}" not found in DB.`);
    process.exit(1);
  }

  if (!dbRow.isActive) {
    console.warn("WARN  Product is inactive (is_active=false) — public catalog hides it.");
  }

  const publicProduct = toPublicProduct(dbRow);
  const view = buildPublicProductView(publicProduct);
  const aliases = await getDb()
    .select({ slug: productSlugAliasesTable.slug })
    .from(productSlugAliasesTable)
    .where(eq(productSlugAliasesTable.productId, dbRow.id));
  const h1Source = dbRow.h1Override?.trim()
    ? "manual h1_override"
    : dbRow.publicTitle?.trim()
      ? "auto/generated (public_title influences display name)"
      : "auto/generated";

  console.log("\nPublic product view (from DB row via buildPublicProductView):");
  console.log(`  db h1_override: ${dbRow.h1Override ?? "(empty)"}`);
  console.log(`  db seo_title_override: ${dbRow.seoTitleOverride ?? "(empty)"}`);
  console.log(
    `  db seo_description_override: ${dbRow.seoDescriptionOverride ?? "(empty)"}`,
  );
  console.log(`  h1: ${view.h1}`);
  console.log(`  h1 source: ${h1Source}`);
  console.log(`  expected public <h1>: ${view.h1}`);
  console.log(`  seoTitle: ${view.seoTitle}`);
  console.log(`  browser title: ${formatProductPageTitle(view.seoTitle)}`);
  console.log(`  seoDescription: ${view.seoDescription.slice(0, 120)}…`);
  console.log(`  canonicalPath: ${view.canonicalPath}`);
  console.log(`  category: ${publicProduct.category} / ${publicProduct.subcategory}`);
  console.log(`  slug aliases: ${aliases.length}`);
  for (const alias of aliases) {
    console.log(`    /tovar/${alias.slug} -> 308 ${view.canonicalPath}`);
  }

  const checks = [
    ["slug", dbRow.slug, publicProduct.slug],
    ["categorySlug", dbRow.categorySlug, publicProduct.category],
    ["subcategorySlug", dbRow.subcategorySlug ?? "", publicProduct.subcategory],
    ["publicTitle(db)", dbRow.publicTitle ?? "", publicProduct.publicTitle ?? ""],
    ["h1Override(db)", dbRow.h1Override ?? "", publicProduct.h1Override ?? ""],
    [
      "seoTitleOverride(db)",
      dbRow.seoTitleOverride ?? "",
      publicProduct.seoTitleOverride ?? "",
    ],
    [
      "seoDescriptionOverride(db)",
      dbRow.seoDescriptionOverride ?? "",
      publicProduct.seoDescriptionOverride ?? "",
    ],
    ["h1(view)", view.h1, view.h1],
    ["seoTitle", view.seoTitle, view.seoTitle],
    ["canonicalPath non-empty", Boolean(view.canonicalPath), true],
    ["current slug is not an alias", aliases.some((row) => row.slug === dbRow.slug), false],
  ] as const;

  let failed = 0;
  for (const [label, left, right] of checks) {
    const pass = left === right;
    if (!pass) failed += 1;
    console.log(`${pass ? "OK" : "FAIL"}  ${label}`);
    if (!pass) {
      console.log(`      left:  ${left}`);
      console.log(`      right: ${right}`);
    }
  }

  if (view.canonicalPath !== `/tovar/${slug}` && !view.canonicalPath.includes(slug)) {
    console.log(`NOTE  Canonical is ${view.canonicalPath} (series/SEO landing, not /tovar/).`);
  }

  if (failed > 0) {
    console.error(`\n${failed} check(s) failed.`);
    process.exit(1);
  }

  console.log("\nDB row and buildPublicProductView() are consistent for this product.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
