import "./db/_env";

import { dbCatalogAdapter } from "@/lib/public-catalog/db-adapter";
import { jsonCatalogAdapter } from "@/lib/public-catalog/json-adapter";
import type { PublicCatalogProduct } from "@/lib/public-catalog/types";

function setEqual(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false;
  for (const x of a) {
    if (!b.has(x)) return false;
  }
  return true;
}

function onlyIn(left: Set<string>, right: Set<string>): string[] {
  return [...left].filter((x) => !right.has(x)).sort();
}

function priceByRequestDistribution(products: PublicCatalogProduct[]) {
  let trueCount = 0;
  let falseCount = 0;
  for (const p of products) {
    if (p.priceByRequest) trueCount += 1;
    else falseCount += 1;
  }
  return { true: trueCount, false: falseCount };
}

function missingPrimaryImageSlugs(products: PublicCatalogProduct[]): string[] {
  return products
    .filter((p) => !p.primaryImageUrl?.trim())
    .map((p) => p.slug)
    .sort();
}

async function main() {
  const [jsonCategories, jsonProducts] = await Promise.all([
    jsonCatalogAdapter.getCategories(),
    jsonCatalogAdapter.getProducts(),
  ]);

  const jsonCategorySlugs = new Set(jsonCategories.map((c) => c.slug));
  const jsonSubcategorySlugs = new Set(
    jsonCategories.flatMap((c) => c.subcategories.map((s) => s.slug)),
  );
  const jsonProductSlugs = new Set(jsonProducts.map((p) => p.slug));

  console.log("JSON adapter snapshot:");
  console.log(`  categories: ${jsonCategories.length}`);
  console.log(`  subcategories: ${jsonSubcategorySlugs.size}`);
  console.log(`  products: ${jsonProducts.length}`);
  console.log(`  priceByRequest: ${JSON.stringify(priceByRequestDistribution(jsonProducts))}`);
  console.log(
    `  products missing primary image: ${missingPrimaryImageSlugs(jsonProducts).length}`,
  );

  if (!process.env.DATABASE_URL?.trim()) {
    console.error("\n[catalog-parity] DATABASE_URL is not set; cannot load DB adapter.");
    process.exit(2);
  }

  let dbCategories: Awaited<ReturnType<typeof dbCatalogAdapter.getCategories>>;
  let dbProducts: Awaited<ReturnType<typeof dbCatalogAdapter.getProducts>>;
  try {
    [dbCategories, dbProducts] = await Promise.all([
      dbCatalogAdapter.getCategories(),
      dbCatalogAdapter.getProducts(),
    ]);
  } catch (e) {
    console.error("\n[catalog-parity] DB adapter failed:", e);
    process.exit(1);
  }

  const dbCategorySlugs = new Set(dbCategories.map((c) => c.slug));
  const dbSubcategorySlugs = new Set(
    dbCategories.flatMap((c) => c.subcategories.map((s) => s.slug)),
  );
  const dbProductSlugs = new Set(dbProducts.map((p) => p.slug));

  console.log("\nDB adapter snapshot:");
  console.log(`  categories: ${dbCategories.length}`);
  console.log(`  subcategories: ${dbSubcategorySlugs.size}`);
  console.log(`  products: ${dbProducts.length}`);
  console.log(`  priceByRequest: ${JSON.stringify(priceByRequestDistribution(dbProducts))}`);
  const dbMissing = missingPrimaryImageSlugs(dbProducts);
  console.log(`  products missing primary image (DB): ${dbMissing.length}`);
  if (dbMissing.length && dbMissing.length <= 30) {
    console.log(`    slugs: ${dbMissing.join(", ")}`);
  } else if (dbMissing.length > 30) {
    console.log(`    (first 20) ${dbMissing.slice(0, 20).join(", ")} …`);
  }

  const checks: { name: string; ok: boolean; detail?: string }[] = [
    {
      name: "category count",
      ok: jsonCategories.length === dbCategories.length,
      detail: `json=${jsonCategories.length} db=${dbCategories.length}`,
    },
    {
      name: "subcategory count",
      ok: jsonSubcategorySlugs.size === dbSubcategorySlugs.size,
      detail: `json=${jsonSubcategorySlugs.size} db=${dbSubcategorySlugs.size}`,
    },
    {
      name: "product count",
      ok: jsonProducts.length === dbProducts.length,
      detail: `json=${jsonProducts.length} db=${dbProducts.length}`,
    },
    {
      name: "category slug set",
      ok: setEqual(jsonCategorySlugs, dbCategorySlugs),
      detail: !setEqual(jsonCategorySlugs, dbCategorySlugs)
        ? `onlyIn(json): ${onlyIn(jsonCategorySlugs, dbCategorySlugs).join(", ") || "—"} | onlyIn(db): ${onlyIn(dbCategorySlugs, jsonCategorySlugs).join(", ") || "—"}`
        : undefined,
    },
    {
      name: "subcategory slug set",
      ok: setEqual(jsonSubcategorySlugs, dbSubcategorySlugs),
      detail: !setEqual(jsonSubcategorySlugs, dbSubcategorySlugs)
        ? `onlyIn(json) sample: ${onlyIn(jsonSubcategorySlugs, dbSubcategorySlugs).slice(0, 15).join(", ") || "—"}`
        : undefined,
    },
    {
      name: "product slug set",
      ok: setEqual(jsonProductSlugs, dbProductSlugs),
      detail: !setEqual(jsonProductSlugs, dbProductSlugs)
        ? `json_only (sample): ${onlyIn(jsonProductSlugs, dbProductSlugs).slice(0, 10).join(", ") || "—"} | db_only (sample): ${onlyIn(dbProductSlugs, jsonProductSlugs).slice(0, 10).join(", ") || "—"}`
        : undefined,
    },
    {
      name: "priceByRequest distribution",
      ok:
        JSON.stringify(priceByRequestDistribution(jsonProducts)) ===
        JSON.stringify(priceByRequestDistribution(dbProducts)),
      detail: `json ${JSON.stringify(priceByRequestDistribution(jsonProducts))} vs db ${JSON.stringify(priceByRequestDistribution(dbProducts))}`,
    },
  ];

  console.log("\n--- Parity ---");
  let allOk = true;
  for (const c of checks) {
    const line = c.ok ? `OK   ${c.name}` : `FAIL ${c.name}`;
    const suffix = c.detail ? ` — ${c.detail}` : "";
    console.log(line + suffix);
    if (!c.ok) allOk = false;
  }

  const dbMissingImages = missingPrimaryImageSlugs(dbProducts).length;
  console.log(
    `\nDB products missing primary image: ${dbMissingImages} (informational; does not fail parity)`,
  );

  if (!allOk) {
    console.error("\n[catalog-parity] One or more structural checks failed.");
    process.exit(1);
  }

  console.log("\n[catalog-parity] All structural checks passed.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
