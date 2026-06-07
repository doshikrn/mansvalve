/**
 * Crawls public pages and reports internal links that return 404/5xx.
 *
 * Usage:
 *   npm run start   # in another terminal
 *   npm run links:audit
 *
 * Base URL: LINKS_AUDIT_BASE_URL or SITE_URL or http://localhost:3000
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { CATALOG_LANDING_PAGES } from "@/lib/catalog-seo";
import { catalogCategoryPath, catalogSubcategoryPath } from "@/lib/catalog-routes";
import { DEFAULT_FOOTER_MAIN } from "@/lib/site-content/models";
import { LEGACY_INTERNAL_LINK_HREFS } from "@/lib/legacy-internal-link-hrefs";
import { listLegacySubcategoryRedirectEntries } from "@/lib/catalog-subcategory-legacy-redirects";

type CatalogJson = {
  categories: Array<{ slug: string; subcategories: Array<{ slug: string }> }>;
  products: Array<{ slug: string }>;
};

function getBaseUrl(): string {
  const fromEnv =
    process.env.LINKS_AUDIT_BASE_URL?.trim() || process.env.SITE_URL?.trim() || "";
  if (fromEnv) {
    return /^https?:\/\//i.test(fromEnv) ? fromEnv.replace(/\/+$/, "") : `https://${fromEnv}`.replace(/\/+$/, "");
  }
  return "http://localhost:3000";
}

function loadSeedPaths(): string[] {
  const catalogPath = join(process.cwd(), "data", "catalog-products.json");
  const catalog = JSON.parse(readFileSync(catalogPath, "utf8")) as CatalogJson;

  const paths = new Set<string>([
    "/",
    "/catalog",
    "/about",
    "/contacts",
    "/certificates",
    "/delivery",
    "/privacy",
    "/terms",
  ]);

  for (const category of catalog.categories) {
    paths.add(catalogCategoryPath(category.slug));
    for (const subcategory of category.subcategories) {
      paths.add(catalogSubcategoryPath(category.slug, subcategory.slug));
    }
  }

  for (const landing of CATALOG_LANDING_PAGES) {
    paths.add(`/${landing.categorySlug}/${landing.slug}`);
  }

  for (const product of catalog.products.slice(0, 12)) {
    paths.add(`/tovar/${product.slug}`);
  }

  for (const link of DEFAULT_FOOTER_MAIN.catalogLinks) {
    paths.add(link.href.split("#")[0]?.split("?")[0] ?? link.href);
  }

  for (const href of Object.keys(LEGACY_INTERNAL_LINK_HREFS)) {
    paths.add(href);
  }

  for (const entry of listLegacySubcategoryRedirectEntries()) {
    paths.add(entry.source);
  }

  return [...paths].sort();
}

function extractInternalHrefs(html: string): string[] {
  const hrefs = new Set<string>();
  const re = /href=["']([^"'#]+)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    const raw = match[1]?.trim();
    if (!raw) continue;
    if (
      raw.startsWith("mailto:") ||
      raw.startsWith("tel:") ||
      raw.startsWith("javascript:") ||
      raw.startsWith("http://") ||
      raw.startsWith("https://") ||
      raw.startsWith("//") ||
      raw.startsWith("/api") ||
      raw.startsWith("/admin") ||
      raw.startsWith("/_next")
    ) {
      continue;
    }
    if (!raw.startsWith("/")) continue;
    const pathOnly = raw.split("?")[0] ?? raw;
    hrefs.add(pathOnly);
  }
  return [...hrefs];
}

type LinkCheck = {
  source: string;
  href: string;
  status: number;
  finalUrl: string;
  redirectChain: string[];
};

type ExpectedRouteCheck = {
  href: string;
  expectedStatus?: number;
  expectedFinalPath?: string;
  expectedRedirectCount?: number;
  label: string;
};

const EXPECTED_ROUTE_CHECKS: ExpectedRouteCheck[] = [
  {
    label: "old Google gate-valve subcategory",
    href: "/catalog/zadvizhki/chugunnye-flantsevye-zadvizhki",
    expectedFinalPath: "/catalog/zadvizhki?subcategory=zadvizhki-chugunnye",
  },
  {
    label: "old nested butterfly valves footer URL",
    href: "/catalog/zatvory/zatvory-diskovye",
    expectedFinalPath: "/catalog/zatvory?subcategory=zatvory-diskovye",
  },
  {
    label: "old nested check valves footer URL",
    href: "/catalog/klapany/podemnye",
    expectedFinalPath: "/catalog/klapany?subcategory=podemnye",
  },
  {
    label: "unknown nested URL must stay 404",
    href: "/catalog/zadvizhki/random-nonsense-url",
    expectedStatus: 404,
    expectedRedirectCount: 0,
  },
];

async function checkHref(base: string, href: string): Promise<Omit<LinkCheck, "source">> {
  const url = new URL(href, `${base}/`).toString();
  const redirectChain: string[] = [];
  let current = url;

  for (let i = 0; i < 8; i++) {
    const res = await fetch(current, { redirect: "manual" });
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (!location) {
        return { href, status: res.status, finalUrl: current, redirectChain };
      }
      const next = new URL(location, current).toString();
      redirectChain.push(`${res.status} → ${next}`);
      current = next;
      continue;
    }
    return { href, status: res.status, finalUrl: current, redirectChain };
  }

  return { href, status: 0, finalUrl: current, redirectChain };
}

function pathFromFinalUrl(finalUrl: string): string {
  try {
    const url = new URL(finalUrl);
    const pathname = url.pathname.replace(/\/+$/, "") || "/";
    return `${pathname}${url.search}`;
  } catch {
    return finalUrl;
  }
}

async function main() {
  const base = getBaseUrl();
  const seedPaths = loadSeedPaths();
  const checks = new Map<string, LinkCheck>();
  const hrefResultCache = new Map<string, Omit<LinkCheck, "source">>();

  console.log(`Base: ${base}`);
  console.log(`Seed pages: ${seedPaths.length}`);
  console.log("—".repeat(100));

  for (const sourcePath of seedPaths) {
    const pageUrl = new URL(sourcePath, `${base}/`).toString();
    let html: string;
    try {
      const res = await fetch(pageUrl, { redirect: "follow" });
      if (!res.ok) {
        console.warn(`WARN seed page ${sourcePath} → HTTP ${res.status}`);
        continue;
      }
      html = await res.text();
    } catch (error) {
      console.warn(`WARN seed page ${sourcePath} → ${error instanceof Error ? error.message : error}`);
      continue;
    }

    for (const href of extractInternalHrefs(html)) {
      const key = `${sourcePath}::${href}`;
      if (checks.has(key)) continue;
      let result = hrefResultCache.get(href);
      if (!result) {
        result = await checkHref(base, href);
        hrefResultCache.set(href, result);
      }
      checks.set(key, { source: sourcePath, ...result });
    }
  }

  const rows = [...checks.values()].sort((a, b) => a.source.localeCompare(b.source));
  const broken = rows.filter((row) => row.status === 404 || row.status >= 500 || row.status === 0);
  const redirects = rows.filter((row) => row.status >= 300 && row.status < 400);
  const expectedFailures: Array<
    ExpectedRouteCheck & { actualStatus: number; actualFinalPath: string }
  > = [];

  for (const expected of EXPECTED_ROUTE_CHECKS) {
    const result = await checkHref(base, expected.href);
    const actualFinalPath = pathFromFinalUrl(result.finalUrl);
    const statusOk =
      expected.expectedStatus === undefined
        ? result.status > 0 && result.status < 400
        : result.status === expected.expectedStatus;
    const finalPathOk =
      expected.expectedFinalPath === undefined || actualFinalPath === expected.expectedFinalPath;
    const redirectCountOk =
      expected.expectedRedirectCount === undefined ||
      result.redirectChain.length === expected.expectedRedirectCount;
    if (!statusOk || !finalPathOk || !redirectCountOk) {
      expectedFailures.push({
        ...expected,
        actualStatus: result.status,
        actualFinalPath,
      });
    }
  }

  console.log(`Internal hrefs checked: ${rows.length}`);
  console.log(`Redirects (manual check): ${redirects.length}`);
  console.log(`Broken: ${broken.length}`);
  console.log(`Expected route checks failed: ${expectedFailures.length}`);
  console.log("—".repeat(100));

  if (broken.length > 0 || expectedFailures.length > 0) {
    if (expectedFailures.length > 0) {
      console.log(`${"route check".padEnd(42)} ${"href".padEnd(50)} actual`);
      for (const row of expectedFailures) {
        console.log(
          `${row.label.padEnd(42)} ${row.href.padEnd(50)} ${row.actualStatus} ${row.actualFinalPath}`,
        );
      }
      console.log("—".repeat(100));
    }

    if (broken.length > 0) {
    console.log(`${"source page".padEnd(42)} ${"broken href".padEnd(42)} status`);
    for (const row of broken) {
      console.log(`${row.source.padEnd(42)} ${row.href.padEnd(42)} ${row.status}`);
    }
    console.log("—".repeat(100));
    }
    process.exit(1);
  }

  console.log("No broken internal links found on audited pages.");
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
