/**
 * Fetches public HTML and prints <title>, meta description, and <h1> count.
 * Reports duplicate meta descriptions and long titles.
 *
 * Usage:
 *   1) npm run start   # in another terminal, production or dev
 *   2) npm run seo:audit
 *
 * Base URL: `SEO_AUDIT_BASE_URL` or `SITE_URL` or `http://localhost:3000`.
 * Optional extra paths: `SEO_AUDIT_EXTRA_PATHS` (comma-separated), e.g.
 *   SEO_AUDIT_EXTRA_PATHS="/catalog/elektroprivod-...,/catalog/category/zadvizhki" npm run seo:audit
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { CATALOG_LANDING_PAGES } from "@/lib/catalog-seo";
import { catalogCategoryPath, catalogSubcategoryListingHref } from "@/lib/catalog-routes";
import { BROWSER_TITLE_MAX_LENGTH, buildBrowserTitleFromPart } from "@/lib/seo/metadata";
import { parsePageMeta, pathFromUrl, parseSitemapLocs } from "@/lib/seo/html-audit";

function getBaseUrl(): string {
  const fromEnv =
    process.env.SEO_AUDIT_BASE_URL?.trim() || process.env.SITE_URL?.trim() || "";
  if (fromEnv) {
    return /^https?:\/\//i.test(fromEnv) ? fromEnv.replace(/\/+$/, "") : `https://${fromEnv}`.replace(/\/+$/, "");
  }
  return "http://localhost:3000";
}

function extraPaths(): string[] {
  const raw = process.env.SEO_AUDIT_EXTRA_PATHS?.trim();
  if (!raw) return [];
  return raw.split(",").map((p) => p.trim()).filter(Boolean);
}

const STATIC_PATHS: string[] = [
  "/",
  "/catalog",
  "/about",
  "/contacts",
  "/certificates",
  "/privacy",
];

function loadCatalogPaths(): string[] {
  try {
    const catalogPath = join(process.cwd(), "data", "catalog-products.json");
    const catalog = JSON.parse(readFileSync(catalogPath, "utf8")) as {
      categories: Array<{ slug: string; subcategories: Array<{ slug: string }> }>;
      products: Array<{ slug: string }>;
    };
    const paths: string[] = [];
    for (const category of catalog.categories) {
      paths.push(catalogCategoryPath(category.slug));
      for (const subcategory of category.subcategories) {
        paths.push(catalogSubcategoryListingHref(category.slug, subcategory.slug));
      }
    }
    for (const landing of CATALOG_LANDING_PAGES) {
      paths.push(`/${landing.categorySlug}/${landing.slug}`);
    }
    for (const product of catalog.products.slice(0, 8)) {
      paths.push(`/tovar/${product.slug}`);
    }
    return paths;
  } catch {
    return [];
  }
}

type AuditResult =
  | {
      ok: true;
      path: string;
      title: string;
      description: string;
      h1Count: number;
      titlePart: string;
      fullTitle: string;
    }
  | { ok: false; path: string; error: string };

async function auditPath(base: string, path: string): Promise<AuditResult> {
  const url = new URL(path, `${base}/`).toString();
  let res: Response;
  try {
    res = await fetch(url, { redirect: "follow" });
  } catch (e) {
    return {
      path,
      ok: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
  if (!res.ok) {
    return { path, ok: false, error: `HTTP ${res.status}` };
  }
  const html = await res.text();
  const meta = parsePageMeta(html);
  const titlePart = meta.title.includes(" | ")
    ? meta.title.split(" | ").slice(0, -1).join(" | ")
    : meta.title;
  return {
    path,
    ok: true,
    title: meta.title || "— (empty) —",
    description: meta.description || "— (empty) —",
    h1Count: meta.h1Count,
    titlePart,
    fullTitle: meta.title,
  };
}

async function loadPathsFromSitemap(base: string): Promise<string[]> {
  if (process.env.SEO_AUDIT_USE_SITEMAP !== "1") return [];
  try {
    const xml = await fetch(`${base}/sitemap.xml`).then((r) => r.text());
    const max = Number.parseInt(process.env.SEO_AUDIT_MAX_URLS ?? "60", 10);
    return parseSitemapLocs(xml).slice(0, max).map(pathFromUrl);
  } catch {
    return [];
  }
}

async function main() {
  const base = getBaseUrl();
  const sitemapPaths = await loadPathsFromSitemap(base);
  const paths = [...new Set([...STATIC_PATHS, ...loadCatalogPaths(), ...extraPaths(), ...sitemapPaths])];

  console.log(`Base: ${base}`);
  console.log(`Paths: ${paths.length}`);
  console.log("—".repeat(100));

  const results: AuditResult[] = [];
  for (const path of paths) {
    results.push(await auditPath(base, path));
  }

  const w = [28, 52, 58, 5];
  console.log(
    `${pad("path", w[0])} ${pad("title", w[1])} ${pad("description", w[2])} ${pad("h1", w[3])}`,
  );
  for (const result of results) {
    if (!result.ok) {
      console.log(`${pad(result.path, w[0])} ${pad("ERROR", w[1])} ${pad(result.error, w[2])} —`);
      continue;
    }
    console.log(
      `${pad(result.path, w[0])} ${pad(result.title.slice(0, 80) + (result.title.length > 80 ? "…" : ""), w[1])} ${pad(result.description.slice(0, 100) + (result.description.length > 100 ? "…" : ""), w[2])} ${pad(String(result.h1Count), w[3])}`,
    );
  }
  console.log("—".repeat(100));

  const okRows = results.filter((r): r is Extract<AuditResult, { ok: true }> => r.ok);
  const badH1 = okRows.filter((r) => r.h1Count !== 1);
  if (badH1.length) {
    console.warn("Expected exactly one <h1> on each page. Check rows where h1 ≠ 1.");
  }

  const longTitles = okRows.filter((r) => r.fullTitle.length > BROWSER_TITLE_MAX_LENGTH);
  if (longTitles.length) {
    console.log(`\nLong titles (>${BROWSER_TITLE_MAX_LENGTH} chars): ${longTitles.length}`);
    for (const row of longTitles) {
      console.log(`  ${row.fullTitle.length} | ${row.path}`);
      console.log(`    ${row.fullTitle}`);
      console.log(`    expected clamp: ${buildBrowserTitleFromPart(row.titlePart)}`);
    }
  }

  const descMap = new Map<string, string[]>();
  for (const row of okRows) {
    const d = row.description === "— (empty) —" ? "" : row.description.trim();
    if (!d) continue;
    if (!descMap.has(d)) descMap.set(d, []);
    descMap.get(d)!.push(row.path);
  }
  const duplicateGroups = [...descMap.entries()].filter(([, urls]) => urls.length > 1);
  if (duplicateGroups.length) {
    console.log(`\nDuplicate meta description groups: ${duplicateGroups.length}`);
    for (const [desc, urls] of duplicateGroups) {
      console.log(`  (${urls.length}) ${desc.slice(0, 90)}${desc.length > 90 ? "…" : ""}`);
      for (const url of urls) console.log(`    - ${url}`);
    }
  }

  if (longTitles.length || duplicateGroups.length) {
    process.exit(1);
  }
}

function pad(s: string, n: number): string {
  const t = s.length > n ? `${s.slice(0, n - 1)}…` : s;
  return t.padEnd(n, " ");
}

void main().catch((e) => {
  console.error(e);
  process.exit(1);
});
