import "./_env";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import {
  categories,
  productSpecs,
  products,
  subcategories,
} from "../../lib/db/schema";

type JsonCategory = {
  id: string;
  name: string;
  slug: string;
  subcategories: {
    id: string;
    name: string;
    slug: string;
    parentCategory: string;
  }[];
};

type JsonProduct = {
  id: string;
  name: string;
  slug: string;
  category: string;
  subcategory: string;
  subcategoryName?: string;
  categoryName?: string;
  dn: number | null;
  pn: number | null;
  thread: string | null;
  material: string;
  connectionType: string;
  controlType: string;
  model: string;
  price: number | null;
  priceByRequest: boolean;
  weight: number | null;
  specs: Record<string, string>;
  shortDescription: string;
};

type CatalogJson = {
  categories: JsonCategory[];
  products: JsonProduct[];
};

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required.");

  const file = path.join(process.cwd(), "data", "catalog-products.json");
  const raw = await readFile(file, "utf8");
  const data = JSON.parse(raw) as CatalogJson;

  const sql = postgres(url, { max: 1 });
  const db = drizzle(sql, {
    schema: { categories, productSpecs, products, subcategories },
  });

  console.log(
    `[import] ${data.categories.length} categories, ${data.products.length} products`,
  );

  /* ------------------------- categories + subcategories ------------------- */
  const categoryIdByExternal = new Map<string, number>();
  for (let i = 0; i < data.categories.length; i++) {
    const cat = data.categories[i];
    const existing = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.externalId, cat.id))
      .limit(1);

    let id: number;
    if (existing.length) {
      id = existing[0].id;
      await db
        .update(categories)
        .set({
          slug: cat.slug,
          name: cat.name,
          sortOrder: i,
          updatedAt: new Date(),
        })
        .where(eq(categories.id, id));
    } else {
      const inserted = await db
        .insert(categories)
        .values({
          externalId: cat.id,
          slug: cat.slug,
          name: cat.name,
          sortOrder: i,
          isActive: true,
        })
        .returning({ id: categories.id });
      id = inserted[0].id;
    }
    categoryIdByExternal.set(cat.id, id);
  }

  const subcategoryIdByExternal = new Map<string, number>();
  for (const cat of data.categories) {
    const parentId = categoryIdByExternal.get(cat.id);
    if (!parentId) continue;
    for (let j = 0; j < cat.subcategories.length; j++) {
      const sub = cat.subcategories[j];
      const existing = await db
        .select({ id: subcategories.id })
        .from(subcategories)
        .where(eq(subcategories.externalId, sub.id))
        .limit(1);

      let id: number;
      if (existing.length) {
        id = existing[0].id;
        await db
          .update(subcategories)
          .set({
            categoryId: parentId,
            slug: sub.slug,
            name: sub.name,
            sortOrder: j,
            updatedAt: new Date(),
          })
          .where(eq(subcategories.id, id));
      } else {
        const inserted = await db
          .insert(subcategories)
          .values({
            externalId: sub.id,
            categoryId: parentId,
            slug: sub.slug,
            name: sub.name,
            sortOrder: j,
            isActive: true,
          })
          .returning({ id: subcategories.id });
        id = inserted[0].id;
      }
      subcategoryIdByExternal.set(sub.id, id);
    }
  }

  /* ------------------------------- products ------------------------------- */
  let created = 0;
  let updated = 0;
  let skipped = 0;
  for (const p of data.products) {
    const categoryId = categoryIdByExternal.get(p.category);
    if (!categoryId) {
      skipped++;
      continue;
    }
    const subcategoryId = p.subcategory
      ? (subcategoryIdByExternal.get(p.subcategory) ?? null)
      : null;

    const existing = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.externalId, p.id))
      .limit(1);

    const values = {
      externalId: p.id,
      slug: p.slug,
      name: p.name,
      categoryId,
      subcategoryId,
      categoryName: p.categoryName ?? "",
      subcategoryName: p.subcategoryName ?? null,
      dn: p.dn ?? null,
      pn: p.pn ?? null,
      thread: p.thread ?? null,
      material: p.material ?? null,
      connectionType: p.connectionType ?? null,
      controlType: p.controlType ?? null,
      model: p.model ?? null,
      price: p.price == null ? null : String(p.price),
      priceByRequest: Boolean(p.priceByRequest),
      weight: p.weight == null ? null : String(p.weight),
      shortDescription: p.shortDescription ?? null,
      isActive: true,
    } as const;

    let productId: number;
    if (existing.length) {
      productId = existing[0].id;
      await db
        .update(products)
        .set({ ...values, updatedAt: new Date() })
        .where(eq(products.id, productId));
      updated++;
    } else {
      const inserted = await db
        .insert(products)
        .values(values)
        .returning({ id: products.id });
      productId = inserted[0].id;
      created++;
    }

    await db.delete(productSpecs).where(eq(productSpecs.productId, productId));
    const specEntries = Object.entries(p.specs ?? {}).filter(
      ([k, v]) => k && v != null && String(v).trim(),
    );
    if (specEntries.length) {
      await db.insert(productSpecs).values(
        specEntries.map(([key, value], index) => ({
          productId,
          key,
          value: String(value),
          sortOrder: index,
        })),
      );
    }
  }

  console.log(
    `[import] done. created=${created}, updated=${updated}, skipped=${skipped}`,
  );
  await sql.end({ timeout: 5 });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
