import "server-only";

import { and, asc, desc, eq, ne, sql } from "drizzle-orm";
import { z } from "zod";

import { getDb } from "@/lib/db/client";
import type { CategorySeoContent } from "@/lib/category-content";
import {
  categories as categoriesTable,
  subcategories as subcategoriesTable,
  type Category,
  type NewCategory,
  type NewSubcategory,
  type Subcategory,
} from "@/lib/db/schema";

const categorySeoContentSchema = z.object({
  topSeo: z.array(z.string()),
  trust: z.array(z.string()),
  bottomSeo: z.array(z.string()),
  ctaHeading: z.string(),
  ctaDescription: z.string(),
});

export function parseCategorySeoPayload(value: unknown): CategorySeoContent | null {
  const parsed = categorySeoContentSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export function categorySeoToFormDefaults(seoContent: unknown): {
  topSeo: string;
  trustLines: string;
  bottomSeo: string;
  ctaHeading: string;
  ctaDescription: string;
} {
  const p = parseCategorySeoPayload(seoContent);
  if (!p) {
    return {
      topSeo: "",
      trustLines: "",
      bottomSeo: "",
      ctaHeading: "",
      ctaDescription: "",
    };
  }
  return {
    topSeo: p.topSeo.join("\n\n"),
    trustLines: p.trust.join("\n"),
    bottomSeo: p.bottomSeo.join("\n\n"),
    ctaHeading: p.ctaHeading,
    ctaDescription: p.ctaDescription,
  };
}

/** Paragraphs separated by a blank line; trims empty entries. */
export function splitParagraphBlocks(raw: string): string[] {
  return raw
    .split(/\n\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** One bullet per line. */
export function splitLineList(raw: string): string[] {
  return raw
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

export type CategoryWithSubcategories = Category & {
  subcategories: Subcategory[];
};

export async function listCategoriesWithSubcategories(): Promise<
  CategoryWithSubcategories[]
> {
  const db = getDb();

  const [cats, subs] = await Promise.all([
    db
      .select()
      .from(categoriesTable)
      .orderBy(asc(categoriesTable.sortOrder), asc(categoriesTable.name)),
    db
      .select()
      .from(subcategoriesTable)
      .orderBy(
        asc(subcategoriesTable.sortOrder),
        asc(subcategoriesTable.name),
      ),
  ]);

  const bucket = new Map<number, Subcategory[]>();
  for (const s of subs) {
    const arr = bucket.get(s.categoryId) ?? [];
    arr.push(s);
    bucket.set(s.categoryId, arr);
  }

  return cats.map((c) => ({ ...c, subcategories: bucket.get(c.id) ?? [] }));
}

export async function listCategoriesFlat(): Promise<Category[]> {
  const db = getDb();
  return db
    .select()
    .from(categoriesTable)
    .orderBy(asc(categoriesTable.sortOrder), asc(categoriesTable.name));
}

export async function listSubcategoriesFor(
  categoryId: number,
): Promise<Subcategory[]> {
  const db = getDb();
  return db
    .select()
    .from(subcategoriesTable)
    .where(eq(subcategoriesTable.categoryId, categoryId))
    .orderBy(asc(subcategoriesTable.sortOrder), asc(subcategoriesTable.name));
}

export async function countCategories(): Promise<number> {
  const db = getDb();
  const rows = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(categoriesTable);
  return rows[0]?.value ?? 0;
}

export async function getCategoryById(id: number): Promise<Category | undefined> {
  const db = getDb();
  const rows = await db
    .select()
    .from(categoriesTable)
    .where(eq(categoriesTable.id, id))
    .limit(1);
  return rows[0];
}

export async function getCategoryWithSubcategoriesById(
  id: number,
): Promise<CategoryWithSubcategories | undefined> {
  const category = await getCategoryById(id);
  if (!category) return undefined;
  const subcategories = await listSubcategoriesFor(id);
  return { ...category, subcategories };
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  const db = getDb();
  const rows = await db
    .select()
    .from(categoriesTable)
    .where(eq(categoriesTable.slug, slug))
    .limit(1);
  return rows[0];
}

export async function getSubcategoryById(id: number): Promise<Subcategory | undefined> {
  const db = getDb();
  const rows = await db
    .select()
    .from(subcategoriesTable)
    .where(eq(subcategoriesTable.id, id))
    .limit(1);
  return rows[0];
}

export async function isCategorySlugTaken(slug: string, excludeId?: number): Promise<boolean> {
  const db = getDb();
  if (excludeId != null) {
    const rows = await db
      .select({ id: categoriesTable.id })
      .from(categoriesTable)
      .where(and(eq(categoriesTable.slug, slug), ne(categoriesTable.id, excludeId)))
      .limit(1);
    return rows.length > 0;
  }
  const rows = await db
    .select({ id: categoriesTable.id })
    .from(categoriesTable)
    .where(eq(categoriesTable.slug, slug))
    .limit(1);
  return rows.length > 0;
}

export async function isSubcategorySlugTaken(
  slug: string,
  excludeId?: number,
): Promise<boolean> {
  const db = getDb();
  if (excludeId != null) {
    const rows = await db
      .select({ id: subcategoriesTable.id })
      .from(subcategoriesTable)
      .where(and(eq(subcategoriesTable.slug, slug), ne(subcategoriesTable.id, excludeId)))
      .limit(1);
    return rows.length > 0;
  }
  const rows = await db
    .select({ id: subcategoriesTable.id })
    .from(subcategoriesTable)
    .where(eq(subcategoriesTable.slug, slug))
    .limit(1);
  return rows.length > 0;
}

export async function getNextCategorySortOrder(): Promise<number> {
  const db = getDb();
  const rows = await db
    .select({ sortOrder: categoriesTable.sortOrder })
    .from(categoriesTable)
    .orderBy(desc(categoriesTable.sortOrder))
    .limit(1);
  return (rows[0]?.sortOrder ?? -1) + 1;
}

export async function getNextSubcategorySortOrder(categoryId: number): Promise<number> {
  const db = getDb();
  const rows = await db
    .select({ sortOrder: subcategoriesTable.sortOrder })
    .from(subcategoriesTable)
    .where(eq(subcategoriesTable.categoryId, categoryId))
    .orderBy(desc(subcategoriesTable.sortOrder))
    .limit(1);
  return (rows[0]?.sortOrder ?? -1) + 1;
}

export async function createCategory(values: NewCategory): Promise<number> {
  const db = getDb();
  const inserted = await db.insert(categoriesTable).values(values).returning({ id: categoriesTable.id });
  const id = inserted[0]?.id;
  if (id == null) throw new Error("createCategory failed");
  return id;
}

export async function updateCategory(
  id: number,
  patch: Partial<
    Pick<
      Category,
      | "name"
      | "slug"
      | "description"
      | "seoMetaDescription"
      | "seoContent"
      | "heroImageUrl"
      | "sortOrder"
      | "isActive"
      | "externalId"
    >
  >,
): Promise<void> {
  const db = getDb();
  await db
    .update(categoriesTable)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(categoriesTable.id, id));
}

export async function createSubcategory(values: NewSubcategory): Promise<number> {
  const db = getDb();
  const inserted = await db
    .insert(subcategoriesTable)
    .values(values)
    .returning({ id: subcategoriesTable.id });
  const id = inserted[0]?.id;
  if (id == null) throw new Error("createSubcategory failed");
  return id;
}

export async function updateSubcategory(
  id: number,
  patch: Partial<
    Pick<
      Subcategory,
      "name" | "slug" | "description" | "seoMetaDescription" | "sortOrder" | "isActive" | "categoryId"
    >
  >,
): Promise<void> {
  const db = getDb();
  await db
    .update(subcategoriesTable)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(subcategoriesTable.id, id));
}
