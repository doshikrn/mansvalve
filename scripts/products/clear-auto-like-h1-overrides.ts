/**
 * Находит товары, у которых h1_override совпадает с auto-кандидатом,
 * и может очистить их для перехода в auto mode.
 *
 * Usage:
 *   npx tsx scripts/products/clear-auto-like-h1-overrides.ts          # dry-run
 *   npx tsx scripts/products/clear-auto-like-h1-overrides.ts --apply
 */

import "../db/_env";

import { eq, isNotNull } from "drizzle-orm";

import { formatProductDisplayName } from "@/lib/catalog/product-naming";
import {
  isAutoLikeH1Override,
  resolveProductAutoH1,
} from "@/lib/catalog/product-seo-naming";
import { getDb } from "@/lib/db/drizzle-core";
import { products as productsTable } from "@/lib/db/schema";

const apply = process.argv.includes("--apply");

async function main() {
  const db = getDb();
  const rows = await db
    .select({
      id: productsTable.id,
      slug: productsTable.slug,
      name: productsTable.name,
      publicTitle: productsTable.publicTitle,
      h1Override: productsTable.h1Override,
      categoryName: productsTable.categoryName,
      subcategoryName: productsTable.subcategoryName,
      model: productsTable.model,
      dn: productsTable.dn,
      pn: productsTable.pn,
      material: productsTable.material,
      connectionType: productsTable.connectionType,
    })
    .from(productsTable)
    .where(isNotNull(productsTable.h1Override));

  const candidates: Array<{
    id: number;
    slug: string;
    h1Override: string;
    matched: string;
  }> = [];

  for (const row of rows) {
    const h1Override = row.h1Override?.trim();
    if (!h1Override) continue;

    const namingInput = {
      name: row.name,
      publicTitle: row.publicTitle ?? undefined,
      categoryName: row.categoryName,
      subcategoryName: row.subcategoryName,
      model: row.model,
      dn: row.dn,
      pn: row.pn,
      material: row.material,
      connectionType: row.connectionType,
    };
    const generatedDisplayName = formatProductDisplayName(namingInput);
    const autoH1 = resolveProductAutoH1(namingInput);
    const candidateValues = [
      row.publicTitle,
      generatedDisplayName,
      autoH1,
      row.name,
    ];

    if (!isAutoLikeH1Override(h1Override, candidateValues)) continue;

    const matched =
      [row.publicTitle, generatedDisplayName, autoH1, row.name].find(
        (value) => value && value.trim() === h1Override,
      ) ?? generatedDisplayName;

    candidates.push({
      id: row.id,
      slug: row.slug,
      h1Override,
      matched,
    });
  }

  console.log(
    apply
      ? `[apply] Clearing ${candidates.length} auto-like h1_override value(s)…`
      : `[dry-run] Found ${candidates.length} product(s) with auto-like h1_override.`,
  );

  const sample = candidates.slice(0, 15);
  for (const item of sample) {
    console.log(
      `  #${item.id} /${item.slug} — h1_override="${item.h1Override}" (matches: "${item.matched}")`,
    );
  }
  if (candidates.length > sample.length) {
    console.log(`  … and ${candidates.length - sample.length} more`);
  }

  if (!apply) {
    if (candidates.length > 0) {
      console.log("\nNo changes made. Re-run with --apply to clear these h1_override values.");
    }
    return;
  }

  let cleared = 0;
  for (const item of candidates) {
    await db
      .update(productsTable)
      .set({ h1Override: null, updatedAt: new Date() })
      .where(eq(productsTable.id, item.id));
    cleared += 1;
  }

  console.log(`\nCleared h1_override for ${cleared} product(s). Slugs were not changed.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
