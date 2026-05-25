/**
 * Slug collision audit for public catalog routing.
 *
 * Usage: npm run catalog:slug-check
 * Data: JSON catalog (always) + DB when DATABASE_URL is set.
 */

import "./db/_env";

import { asc, eq } from "drizzle-orm";

import { CATALOG_LANDING_PAGES } from "@/lib/catalog-seo";
import { getDb } from "@/lib/db/drizzle-core";
import {
  categories as categoriesTable,
  products as productsTable,
  subcategories as subcategoriesTable,
} from "@/lib/db/schema";
import { jsonCatalogAdapter } from "@/lib/public-catalog/json-adapter";
import {
  getSeriesPagePath,
  PRODUCT_SERIES_SEO_PAGES,
} from "@/lib/seo-product-pages/product-series";

const RESERVED_ROOT_SEGMENTS = new Set([
  "admin",
  "api",
  "about",
  "catalog",
  "certificates",
  "contacts",
  "delivery",
  "privacy",
  "terms",
  "tovar",
  "robots.txt",
  "sitemap.xml",
  "apple-icon.png",
  "icon.svg",
]);

type Severity = "critical" | "warning";

type SlugCollision = {
  severity: Severity;
  kind: string;
  slug: string;
  detail: string;
  brokenRoute: string;
  recommendation: string;
};

type SlugAuditSubcategory = { slug: string; name: string };
type SlugAuditCategory = {
  id: string;
  name: string;
  slug: string;
  subcategories: SlugAuditSubcategory[];
};
type SlugAuditProduct = { slug: string; name: string };

type CatalogSnapshot = {
  source: string;
  categories: SlugAuditCategory[];
  products: SlugAuditProduct[];
};

function pushCollision(
  out: SlugCollision[],
  row: SlugCollision,
): void {
  out.push(row);
}

function indexSubcategories(categories: SlugAuditCategory[]) {
  const bySlug = new Map<
    string,
    Array<{ categorySlug: string; categoryId: string; subName: string }>
  >();
  for (const cat of categories) {
    for (const sub of cat.subcategories) {
      const list = bySlug.get(sub.slug) ?? [];
      list.push({
        categorySlug: cat.slug,
        categoryId: cat.id,
        subName: sub.name,
      });
      bySlug.set(sub.slug, list);
    }
  }
  return bySlug;
}

function auditCatalogSnapshot(snapshot: CatalogSnapshot): SlugCollision[] {
  const { source, categories, products } = snapshot;
  const collisions: SlugCollision[] = [];
  const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));
  const productBySlug = new Map(products.map((p) => [p.slug, p]));
  const subBySlug = indexSubcategories(categories);

  // --- Reserved root segments (landing / static routes) ---
  for (const cat of categories) {
    if (RESERVED_ROOT_SEGMENTS.has(cat.slug)) {
      pushCollision(collisions, {
        severity: "critical",
        kind: "category_reserved_segment",
        slug: cat.slug,
        detail: `[${source}] category.slug совпадает с зарезервированным сегментом приложения`,
        brokenRoute: `/catalog/${cat.slug}, /${cat.slug}/…`,
        recommendation: `Переименовать slug категории «${cat.name}»`,
      });
    }
  }
  for (const p of products) {
    if (RESERVED_ROOT_SEGMENTS.has(p.slug)) {
      pushCollision(collisions, {
        severity: "critical",
        kind: "product_reserved_segment",
        slug: p.slug,
        detail: `[${source}] product.slug совпадает с зарезервированным сегментом`,
        brokenRoute: `/catalog/${p.slug} → canonical, /tovar/${p.slug}`,
        recommendation: `Переименовать slug товара «${p.name}»`,
      });
    }
  }

  // --- product.slug ∩ category.slug (blocks /catalog/[slug] category page) ---
  for (const product of products) {
    const category = categoryBySlug.get(product.slug);
    if (!category) continue;
    pushCollision(collisions, {
      severity: "critical",
      kind: "product_category_slug",
      slug: product.slug,
      detail: `[${source}] товар «${product.name}» и категория «${category.name}» с одним slug`,
      brokenRoute: `/catalog/${product.slug} — сначала товар (308 на canonical), страница категории недоступна`,
      recommendation: `Переименовать slug товара или категории (рекомендуется у товара: ${product.slug})`,
    });
  }

  // --- product.slug ∩ subcategory.slug (same /catalog/[slug] if product exists) ---
  for (const product of products) {
    const subs = subBySlug.get(product.slug);
    if (!subs?.length) continue;
    const subList = subs.map((s) => `${s.categorySlug}/${s.subName}`).join("; ");
    pushCollision(collisions, {
      severity: "warning",
      kind: "product_subcategory_slug",
      slug: product.slug,
      detail: `[${source}] товар «${product.name}» совпадает с subcategory.slug: ${subList}`,
      brokenRoute: `/catalog/${product.slug} отдаёт товар; подкатегория только по /catalog/{cat}/${product.slug}`,
      recommendation: `По возможности переименовать slug товара «${product.slug}»`,
    });
  }

  // --- category.slug ∩ subcategory.slug (global) ---
  for (const cat of categories) {
    const subs = subBySlug.get(cat.slug);
    if (!subs?.length) continue;
    const foreign = subs.filter((s) => s.categorySlug !== cat.slug);
    if (foreign.length === 0) {
      pushCollision(collisions, {
        severity: "warning",
        kind: "category_subcategory_slug",
        slug: cat.slug,
        detail: `[${source}] slug категории «${cat.name}» совпадает с подкатегорией внутри той же категории`,
        brokenRoute: `/catalog/${cat.slug} — категория, если нет товара с тем же slug`,
        recommendation: `Переименовать slug категории или подкатегории`,
      });
    }
  }

  // --- Duplicate slugs within entity type ---
  const dup = (slugs: string[], kind: string, route: string) => {
    const seen = new Map<string, number>();
    for (const s of slugs) seen.set(s, (seen.get(s) ?? 0) + 1);
    for (const [slug, count] of seen) {
      if (count > 1) {
        pushCollision(collisions, {
          severity: "critical",
          kind: `duplicate_${kind}`,
          slug,
          detail: `[${source}] slug встречается ${count} раз(а)`,
          brokenRoute: route,
          recommendation: `Сделать slug уникальным для каждой сущности`,
        });
      }
    }
  };
  dup(
    products.map((p) => p.slug),
    "product",
    "/catalog/[slug], /tovar/[slug]",
  );
  dup(
    categories.map((c) => c.slug),
    "category",
    "/catalog/[slug]",
  );
  for (const cat of categories) {
    dup(
      cat.subcategories.map((s) => s.slug),
      "subcategory",
      `/catalog/${cat.slug}/[subcategorySlug]`,
    );
  }

  // --- SEO landing pages (static config) ---
  const landingPathKeys = new Map<string, string>();
  for (const landing of CATALOG_LANDING_PAGES) {
    const path = `/${landing.categorySlug}/${landing.slug}`;
    if (!categoryBySlug.has(landing.categorySlug)) {
      pushCollision(collisions, {
        severity: "warning",
        kind: "landing_unknown_category",
        slug: landing.categorySlug,
        detail: `Landing «${landing.h1}»: categorySlug «${landing.categorySlug}» нет в каталоге (${source})`,
        brokenRoute: path,
        recommendation: `Выровнять categorySlug в CATALOG_LANDING_PAGES с category.slug в данных`,
      });
    } else if (
      categoryBySlug.get(landing.categorySlug)!.id !== landing.filters.categoryId
    ) {
      const cat = categoryBySlug.get(landing.categorySlug)!;
      pushCollision(collisions, {
        severity: "warning",
        kind: "landing_category_id_mismatch",
        slug: `${landing.categorySlug}/${landing.slug}`,
        detail: `Landing filters.categoryId=${landing.filters.categoryId}, в каталоге id=${cat.id}`,
        brokenRoute: path,
        recommendation: `Синхронизировать filters.categoryId с id категории «${cat.name}»`,
      });
    }

    const prev = landingPathKeys.get(path);
    if (prev) {
      pushCollision(collisions, {
        severity: "critical",
        kind: "landing_duplicate_path",
        slug: path,
        detail: `Два landing с одним URL: «${prev}» и «${landing.h1}»`,
        brokenRoute: path,
        recommendation: "Изменить categorySlug или slug одного из landing",
      });
    } else {
      landingPathKeys.set(path, landing.h1);
    }

    if (productBySlug.has(landing.slug)) {
      const product = productBySlug.get(landing.slug)!;
      pushCollision(collisions, {
        severity: "warning",
        kind: "landing_product_slug",
        slug: landing.slug,
        detail: `Landing ${path} и товар «${product.name}» (${source}) с тем же slug`,
        brokenRoute: `${path} vs /catalog/${product.slug}, /tovar/${product.slug}`,
        recommendation: `Убедиться, что это задумано; иначе переименовать landing.slug или product.slug`,
      });
    }

    if (categoryBySlug.has(landing.slug)) {
      pushCollision(collisions, {
        severity: "warning",
        kind: "landing_category_slug",
        slug: landing.slug,
        detail: `Landing slug «${landing.slug}» совпадает с category.slug «${landing.slug}»`,
        brokenRoute: `/${landing.categorySlug}/${landing.slug} vs /catalog/${landing.slug}`,
        recommendation: "Переименовать landing.slug",
      });
    }
  }

  // --- Series SEO pages vs landing (same /{cat}/{slug} path) ---
  const twoSegmentRoutes = new Map<string, string>();
  for (const page of PRODUCT_SERIES_SEO_PAGES) {
    const path = getSeriesPagePath(page);
    const segments = path.split("/").filter(Boolean);
    if (segments.length !== 2) continue;

    const prevSeries = twoSegmentRoutes.get(path);
    if (prevSeries) {
      pushCollision(collisions, {
        severity: "critical",
        kind: "series_duplicate_path",
        slug: path,
        detail: `Две SEO-series страницы с URL ${path}`,
        brokenRoute: path,
        recommendation: "Изменить slug или path одной из series-страниц",
      });
    } else {
      twoSegmentRoutes.set(path, page.slug);
    }

    const landingTitle = landingPathKeys.get(path);
    if (landingTitle) {
      pushCollision(collisions, {
        severity: "critical",
        kind: "landing_series_path",
        slug: path,
        detail: `Landing «${landingTitle}» и SEO-series «${page.slug}» — один URL (в коде landing имеет приоритет)`,
        brokenRoute: path,
        recommendation: "Изменить slug landing или series, чтобы пути разошлись",
      });
    }

  }

  return collisions;
}

function toSlugAuditCategories(
  categories: Awaited<ReturnType<typeof jsonCatalogAdapter.getCategories>>,
): SlugAuditCategory[] {
  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    subcategories: c.subcategories.map((s) => ({
      slug: s.slug,
      name: s.name,
    })),
  }));
}

async function loadJsonSnapshot(): Promise<CatalogSnapshot> {
  const [categories, products] = await Promise.all([
    jsonCatalogAdapter.getCategories(),
    jsonCatalogAdapter.getProducts(),
  ]);
  return {
    source: "json",
    categories: toSlugAuditCategories(categories),
    products: products.map((p) => ({ slug: p.slug, name: p.name })),
  };
}

/** Slug-only DB load (avoids `server-only` media stack from db-adapter). */
async function loadDbSnapshot(): Promise<CatalogSnapshot> {
  const db = getDb();
  const catRows = await db
    .select({
      pk: categoriesTable.id,
      externalId: categoriesTable.externalId,
      name: categoriesTable.name,
      slug: categoriesTable.slug,
    })
    .from(categoriesTable)
    .where(eq(categoriesTable.isActive, true))
    .orderBy(asc(categoriesTable.sortOrder));

  const subRows = await db
    .select({
      categoryId: subcategoriesTable.categoryId,
      name: subcategoriesTable.name,
      slug: subcategoriesTable.slug,
    })
    .from(subcategoriesTable)
    .where(eq(subcategoriesTable.isActive, true))
    .orderBy(asc(subcategoriesTable.sortOrder));

  const prodRows = await db
    .select({
      slug: productsTable.slug,
      name: productsTable.name,
    })
    .from(productsTable)
    .where(eq(productsTable.isActive, true))
    .orderBy(asc(productsTable.slug));

  const categoryByPk = new Map<number, SlugAuditCategory>();
  const categories: SlugAuditCategory[] = [];
  for (const row of catRows) {
    const id = row.externalId?.trim() || row.slug;
    const cat: SlugAuditCategory = {
      id,
      name: row.name,
      slug: row.slug,
      subcategories: [],
    };
    categoryByPk.set(row.pk, cat);
    categories.push(cat);
  }

  for (const sub of subRows) {
    const cat = categoryByPk.get(sub.categoryId);
    if (!cat) continue;
    cat.subcategories.push({ slug: sub.slug, name: sub.name });
  }

  return {
    source: "db",
    categories,
    products: prodRows.map((p) => ({ slug: p.slug, name: p.name })),
  };
}

function printCollisions(collisions: SlugCollision[]): void {
  if (collisions.length === 0) return;
  const critical = collisions.filter((c) => c.severity === "critical");
  const warning = collisions.filter((c) => c.severity === "warning");
  console.log(`\n--- Collisions (${critical.length} critical, ${warning.length} warning) ---`);
  for (const c of [...critical, ...warning]) {
    console.log(`\n[${c.severity.toUpperCase()}] ${c.kind}: ${c.slug}`);
    console.log(`  ${c.detail}`);
    console.log(`  Route: ${c.brokenRoute}`);
    console.log(`  → ${c.recommendation}`);
  }
}

async function main() {
  console.log("[catalog-slug-check] Slug collision audit\n");

  const jsonSnapshot = await loadJsonSnapshot();
  console.log(
    `JSON: ${jsonSnapshot.categories.length} categories, ${jsonSnapshot.products.length} products`,
  );
  const jsonCollisions = auditCatalogSnapshot(jsonSnapshot);
  printCollisions(jsonCollisions);

  let dbCollisions: SlugCollision[] = [];
  if (!process.env.DATABASE_URL?.trim()) {
    console.log("\nDATABASE_URL not set — DB check skipped.");
  } else {
    try {
      const dbSnapshot = await loadDbSnapshot();
      console.log(
        `\nDB: ${dbSnapshot.categories.length} categories, ${dbSnapshot.products.length} products`,
      );
      dbCollisions = auditCatalogSnapshot(dbSnapshot);
      printCollisions(dbCollisions);
    } catch (e) {
      console.error("\n[catalog-slug-check] DB load failed:", e);
      process.exit(1);
    }
  }

  const all = [...jsonCollisions, ...dbCollisions];
  const criticalCount = all.filter((c) => c.severity === "critical").length;

  if (all.length === 0) {
    console.log("\n[catalog-slug-check] OK — slug collisions not found.");
    process.exit(0);
  }

  if (criticalCount === 0) {
    console.log(
      `\n[catalog-slug-check] OK — no critical collisions (${all.length} warning(s) only).`,
    );
    process.exit(0);
  }

  console.error(
    `\n[catalog-slug-check] Found ${criticalCount} critical collision(s) (${all.length} total).`,
  );
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
