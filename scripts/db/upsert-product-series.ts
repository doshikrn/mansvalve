import "./_env";

import { eq, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import {
  categories,
  products,
  subcategories,
} from "../../lib/db/schema";
import {
  INDUSTRIAL_SERIES_SEO_PAGES,
  type IndustrialSeriesSeoPage,
} from "../../lib/seo-product-pages/industrial-series";

type CategorySeed = {
  externalId: string;
  slug: string;
  name: string;
  sortOrder: number;
};

type SubcategorySeed = {
  externalId: string;
  slug: string;
  name: string;
  categoryExternalId: string;
  sortOrder: number;
};

const CATEGORY_SEEDS: CategorySeed[] = [
  {
    externalId: "filtry-i-kompensatory",
    slug: "filtry-i-kompensatory",
    name: "Фильтры и компенсаторы",
    sortOrder: 4,
  },
  {
    externalId: "klapany",
    slug: "klapany",
    name: "Клапаны",
    sortOrder: 3,
  },
];

const SUBCATEGORY_SEEDS: SubcategorySeed[] = [
  {
    externalId: "kompensatory",
    slug: "kompensatory",
    name: "Компенсаторы",
    categoryExternalId: "filtry-i-kompensatory",
    sortOrder: 1,
  },
  {
    externalId: "klapany-obratnye",
    slug: "klapany-obratnye",
    name: "Обратные клапаны",
    categoryExternalId: "klapany",
    sortOrder: 0,
  },
];

function productExternalId(page: IndustrialSeriesSeoPage): string {
  return `series:${page.kind}:${page.slug}`;
}

function productName(page: IndustrialSeriesSeoPage): string {
  return page.title;
}

function productMaterial(page: IndustrialSeriesSeoPage): string {
  return page.kind === "compensator-kso-k" ? "Сталь / нержавеющая сталь" : "Сталь";
}

function productConnection(page: IndustrialSeriesSeoPage): string {
  return page.kind === "compensator-kso-k" ? "Под приварку" : "Фланцевое";
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required.");

  const sql = postgres(url, { max: 1 });
  const db = drizzle(sql, {
    schema: { categories, products, subcategories },
  });

  const categoryIdByExternal = new Map<string, number>();

  for (const seed of CATEGORY_SEEDS) {
    const existing = await db
      .select({ id: categories.id })
      .from(categories)
      .where(or(eq(categories.externalId, seed.externalId), eq(categories.slug, seed.slug)))
      .limit(1);

    if (existing.length) {
      const id = existing[0].id;
      await db
        .update(categories)
        .set({
          externalId: seed.externalId,
          slug: seed.slug,
          name: seed.name,
          sortOrder: seed.sortOrder,
          isActive: true,
          updatedAt: new Date(),
        })
        .where(eq(categories.id, id));
      categoryIdByExternal.set(seed.externalId, id);
      continue;
    }

    const inserted = await db
      .insert(categories)
      .values({
        externalId: seed.externalId,
        slug: seed.slug,
        name: seed.name,
        sortOrder: seed.sortOrder,
        isActive: true,
      })
      .returning({ id: categories.id });
    categoryIdByExternal.set(seed.externalId, inserted[0].id);
  }

  const subcategoryIdByExternal = new Map<string, number>();

  for (const seed of SUBCATEGORY_SEEDS) {
    const categoryId = categoryIdByExternal.get(seed.categoryExternalId);
    if (!categoryId) throw new Error(`Missing category ${seed.categoryExternalId}`);

    const existing = await db
      .select({ id: subcategories.id })
      .from(subcategories)
      .where(or(eq(subcategories.externalId, seed.externalId), eq(subcategories.slug, seed.slug)))
      .limit(1);

    if (existing.length) {
      const id = existing[0].id;
      await db
        .update(subcategories)
        .set({
          externalId: seed.externalId,
          categoryId,
          slug: seed.slug,
          name: seed.name,
          sortOrder: seed.sortOrder,
          isActive: true,
          updatedAt: new Date(),
        })
        .where(eq(subcategories.id, id));
      subcategoryIdByExternal.set(seed.externalId, id);
      continue;
    }

    const inserted = await db
      .insert(subcategories)
      .values({
        externalId: seed.externalId,
        categoryId,
        slug: seed.slug,
        name: seed.name,
        sortOrder: seed.sortOrder,
        isActive: true,
      })
      .returning({ id: subcategories.id });
    subcategoryIdByExternal.set(seed.externalId, inserted[0].id);
  }

  let created = 0;
  let updated = 0;
  let skippedSlugChange = 0;

  for (const [index, page] of INDUSTRIAL_SERIES_SEO_PAGES.entries()) {
    const categoryId = categoryIdByExternal.get(page.catalogCategoryId);
    const subcategoryId = subcategoryIdByExternal.get(page.catalogSubcategoryId);
    if (!categoryId || !subcategoryId) {
      throw new Error(`Missing taxonomy for ${page.path}`);
    }

    const externalId = productExternalId(page);
    const existing = await db
      .select({
        id: products.id,
        slug: products.slug,
        publicTitle: products.publicTitle,
        h1Override: products.h1Override,
        shortDescription: products.shortDescription,
        longDescription: products.longDescription,
        detailBlocks: products.detailBlocks,
      })
      .from(products)
      .where(or(eq(products.externalId, externalId), eq(products.slug, page.slug)))
      .limit(1);

    const generatedValues = {
      externalId,
      slug: page.slug,
      name: productName(page),
      categoryId,
      subcategoryId,
      categoryName: page.catalogCategoryName,
      subcategoryName: page.catalogSubcategoryName,
      dn: page.dn,
      pn: page.pn,
      thread: null,
      material: productMaterial(page),
      connectionType: productConnection(page),
      controlType: "Автоматическое" as const,
      model: page.model,
      price: null,
      priceByRequest: true,
      weight: null,
      isActive: true,
      sortOrder: index,
    };

    if (existing.length) {
      const row = existing[0];
      if (row.slug !== page.slug) {
        skippedSlugChange += 1;
        console.warn(
          `[series] skip slug change for product #${row.id}: ${row.slug} -> ${page.slug}`,
        );
      }
      await db
        .update(products)
        .set({
          ...generatedValues,
          slug: row.slug === page.slug ? page.slug : row.slug,
          // Preserve manager-owned content fields and template overrides.
          publicTitle: row.publicTitle,
          h1Override: row.h1Override,
          shortDescription: row.shortDescription,
          longDescription: row.longDescription,
          detailBlocks: row.detailBlocks,
          updatedAt: new Date(),
        })
        .where(eq(products.id, row.id));
      updated += 1;
      continue;
    }

    await db.insert(products).values({
      ...generatedValues,
      publicTitle: null,
      h1Override: null,
      shortDescription: null,
      longDescription: null,
      detailBlocks: null,
    });
    created += 1;
  }

  console.log(
    `[series] done. pages=${INDUSTRIAL_SERIES_SEO_PAGES.length} created=${created} updated=${updated} skippedSlugChange=${skippedSlugChange}`,
  );
  await sql.end({ timeout: 5 });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

