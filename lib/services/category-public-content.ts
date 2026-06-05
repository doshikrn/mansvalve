import "server-only";

import { eq } from "drizzle-orm";

import type { CategorySeoContent } from "@/lib/category-content";
import { getCategorySeoContent } from "@/lib/category-content";
import { isDatabaseConfigured } from "@/lib/db/client";
import { getDb } from "@/lib/db/client";
import { categories as categoriesTable, subcategories as subcategoriesTable } from "@/lib/db/schema";
import { parseCategorySeoPayload } from "@/lib/services/categories";

/**
 * A DB SEO payload can be structurally valid yet semantically empty
 * (e.g. `{ topSeo: [], trust: [], bottomSeo: [] }`), which would render a thin
 * category page. Treat it as "has content" only when at least one visible
 * block is present; otherwise fall back to the static preset.
 */
function hasMeaningfulCategorySeo(seo: CategorySeoContent): boolean {
  return (
    seo.topSeo.length > 0 || seo.trust.length > 0 || seo.bottomSeo.length > 0
  );
}

/**
 * Public category pages: load SEO blocks from DB when present and valid,
 * otherwise fall back to `lib/category-content.ts` (static).
 */
export async function resolveCategorySeoForPublicPage(
  slug: string,
): Promise<CategorySeoContent | undefined> {
  if (!isDatabaseConfigured()) {
    return getCategorySeoContent(slug);
  }

  try {
    const db = getDb();
    const rows = await db
      .select({ seoContent: categoriesTable.seoContent })
      .from(categoriesTable)
      .where(eq(categoriesTable.slug, slug))
      .limit(1);
    const fromDb = parseCategorySeoPayload(rows[0]?.seoContent ?? null);
    if (fromDb && hasMeaningfulCategorySeo(fromDb)) return fromDb;
  } catch {
    // ignore and fall back
  }

  return getCategorySeoContent(slug);
}

export async function resolveCategoryHeroImageUrl(slug: string): Promise<string | null> {
  if (!isDatabaseConfigured()) return null;
  try {
    const db = getDb();
    const rows = await db
      .select({ heroImageUrl: categoriesTable.heroImageUrl })
      .from(categoriesTable)
      .where(eq(categoriesTable.slug, slug))
      .limit(1);
    const url = rows[0]?.heroImageUrl?.trim();
    return url || null;
  } catch {
    return null;
  }
}

export async function resolveCategorySeoMetaDescription(slug: string): Promise<string | null> {
  if (!isDatabaseConfigured()) return null;
  try {
    const db = getDb();
    const rows = await db
      .select({ seoMetaDescription: categoriesTable.seoMetaDescription })
      .from(categoriesTable)
      .where(eq(categoriesTable.slug, slug))
      .limit(1);
    const d = rows[0]?.seoMetaDescription?.trim();
    return d || null;
  } catch {
    return null;
  }
}

export async function resolveSubcategorySeoMetaDescription(
  slug: string,
): Promise<string | null> {
  if (!isDatabaseConfigured()) return null;
  try {
    const db = getDb();
    const rows = await db
      .select({ seoMetaDescription: subcategoriesTable.seoMetaDescription })
      .from(subcategoriesTable)
      .where(eq(subcategoriesTable.slug, slug))
      .limit(1);
    const d = rows[0]?.seoMetaDescription?.trim();
    return d || null;
  } catch {
    return null;
  }
}
