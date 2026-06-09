/**
 * Technical SEO audit: robots, sitemap, meta duplicates, long titles, links.
 *
 * Usage:
 *   npm run seo:technical-audit
 *   SEO_AUDIT_BASE_URL=https://mansvalve-group.kz npm run seo:technical-audit
 *
 * Optional:
 *   SEO_AUDIT_MAX_URLS=120   — cap sitemap URLs audited (default 120)
 *   SEO_AUDIT_FETCH_CONCURRENCY=6
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { CATALOG_LANDING_PAGES } from "@/lib/catalog-seo";
import { catalogCategoryPath, catalogSubcategoryPath } from "@/lib/catalog-routes";
import { BROWSER_TITLE_MAX_LENGTH } from "@/lib/seo/metadata";
import { buildRobotsTxtBody } from "@/lib/seo/robots-text";
import {
  classifyExternalHref,
  guessLinkSourceComponent,
} from "@/lib/seo/external-link-rules";
import {
  extractHrefs,
  parsePageMeta,
  parseSitemapLocs,
  pathFromUrl,
} from "@/lib/seo/html-audit";
import { DEFAULT_FOOTER_MAIN } from "@/lib/site-content/models";

type AuditIssue = {
  level: "error" | "warning";
  code: string;
  message: string;
  urls?: string[];
};

type ExternalLinkRecord = {
  href: string;
  status: number | "skip" | "error";
  error?: string;
  sources: Set<string>;
  component: string;
  skipReason?: string;
};

function getBaseUrl(): string {
  const fromEnv =
    process.env.SEO_AUDIT_BASE_URL?.trim() || process.env.SITE_URL?.trim() || "";
  if (fromEnv) {
    return /^https?:\/\//i.test(fromEnv)
      ? fromEnv.replace(/\/+$/, "")
      : `https://${fromEnv}`.replace(/\/+$/, "");
  }
  return "http://localhost:3000";
}

function loadSeedPaths(): string[] {
  const catalogPath = join(process.cwd(), "data", "catalog-products.json");
  const catalog = JSON.parse(readFileSync(catalogPath, "utf8")) as {
    categories: Array<{ slug: string; subcategories: Array<{ slug: string }> }>;
    products: Array<{ slug: string }>;
  };

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

  for (const product of catalog.products.slice(0, 16)) {
    paths.add(`/tovar/${product.slug}`);
  }

  for (const link of DEFAULT_FOOTER_MAIN.catalogLinks) {
    paths.add(link.href.split("#")[0]?.split("?")[0] ?? link.href);
  }

  return [...paths].sort();
}

async function fetchText(url: string): Promise<{ ok: boolean; status: number; text: string; contentType: string }> {
  const res = await fetch(url, { redirect: "follow" });
  const contentType = res.headers.get("content-type") ?? "";
  const text = await res.text();
  return { ok: res.ok, status: res.status, text, contentType };
}

async function checkHref(
  base: string,
  href: string,
): Promise<{ status: number; finalUrl: string; error?: string }> {
  const url = new URL(href, `${base}/`).toString();
  try {
    const res = await fetch(url, { redirect: "manual" });
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (!location) return { status: res.status, finalUrl: url };
      const next = new URL(location, url).toString();
      const follow = await fetch(next, { redirect: "follow" });
      return { status: follow.status, finalUrl: follow.url };
    }
    return { status: res.status, finalUrl: url };
  } catch (error) {
    return {
      status: 0,
      finalUrl: url,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function classifyPageType(path: string): string {
  if (path.startsWith("/tovar/")) return "product";
  if (path.match(/^\/catalog\/[^/]+\/[^/]+/)) return "subcategory";
  if (path.startsWith("/catalog/")) return "category";
  if (path === "/catalog") return "catalog-listing";
  return "static/service";
}

async function auditRobots(base: string, issues: AuditIssue[]): Promise<void> {
  const url = `${base}/robots.txt`;
  let result: Awaited<ReturnType<typeof fetchText>>;
  try {
    result = await fetchText(url);
  } catch (error) {
    issues.push({
      level: "error",
      code: "robots-fetch",
      message: `robots.txt fetch failed: ${error instanceof Error ? error.message : error}`,
    });
    return;
  }

  if (result.status !== 200) {
    issues.push({
      level: "error",
      code: "robots-status",
      message: `robots.txt HTTP ${result.status} (expected 200)`,
    });
  }

  if (!/text\/plain/i.test(result.contentType)) {
    issues.push({
      level: "error",
      code: "robots-content-type",
      message: `robots.txt Content-Type is "${result.contentType}" (expected text/plain)`,
    });
  }

  if (/<html|<!doctype/i.test(result.text) || result.text.trim().startsWith("{")) {
    issues.push({
      level: "error",
      code: "robots-not-plain",
      message: "robots.txt contains HTML or JSON",
    });
  }

  if (/content-signal:/i.test(result.text)) {
    issues.push({
      level: "error",
      code: "robots-cloudflare-content-signal",
      message:
        "robots.txt contains non-standard Cloudflare Content-Signal directives — disable Cloudflare Managed robots.txt / AI Crawl Control in the dashboard",
    });
  }

  const expectedTail = buildRobotsTxtBody(base).trim();
  if (!result.text.includes("Disallow: /admin/") || !result.text.includes("Disallow: /api/")) {
    issues.push({
      level: "error",
      code: "robots-disallow",
      message: "robots.txt must disallow /admin/ and /api/",
    });
  }

  if (!result.text.includes(`Sitemap: ${base}/sitemap.xml`)) {
    issues.push({
      level: "error",
      code: "robots-sitemap",
      message: `robots.txt must include Sitemap: ${base}/sitemap.xml`,
    });
  }

  if (/disallow:\s*\/catalog/i.test(result.text) || /disallow:\s*\/tovar/i.test(result.text)) {
    issues.push({
      level: "error",
      code: "robots-blocks-catalog",
      message: "robots.txt must not block /catalog/ or /tovar/",
    });
  }

  if (!result.text.trim().endsWith(expectedTail.split("\n").pop() ?? "")) {
    // informational only when CF prepends managed block
    if (!/content-signal:/i.test(result.text)) {
      issues.push({
        level: "warning",
        code: "robots-body-drift",
        message: "robots.txt body differs from app template (check deployment)",
      });
    }
  }
}

async function auditSitemap(base: string, issues: AuditIssue[]): Promise<string[]> {
  const url = `${base}/sitemap.xml`;
  try {
    const result = await fetchText(url);
    if (result.status !== 200) {
      issues.push({
        level: "error",
        code: "sitemap-status",
        message: `sitemap.xml HTTP ${result.status}`,
      });
      return [];
    }
    if (!/xml/i.test(result.contentType) && !result.text.includes("<urlset")) {
      issues.push({
        level: "error",
        code: "sitemap-format",
        message: `sitemap.xml unexpected Content-Type: ${result.contentType}`,
      });
    }
    return parseSitemapLocs(result.text);
  } catch (error) {
    issues.push({
      level: "error",
      code: "sitemap-fetch",
      message: `sitemap.xml fetch failed: ${error instanceof Error ? error.message : error}`,
    });
    return [];
  }
}

async function main() {
  const base = getBaseUrl();
  const siteOrigin = new URL(base).origin;
  const maxUrls = Number.parseInt(process.env.SEO_AUDIT_MAX_URLS ?? "120", 10);
  const issues: AuditIssue[] = [];

  console.log(`Technical SEO audit — ${base}`);
  console.log("=".repeat(80));

  await auditRobots(base, issues);
  const sitemapUrls = await auditSitemap(base, issues);

  const seedPaths = loadSeedPaths();
  const auditPaths = new Set<string>(seedPaths);
  for (const url of sitemapUrls.slice(0, maxUrls)) {
    auditPaths.add(pathFromUrl(url));
  }

  const pageMetaRows: Array<{
    path: string;
    type: string;
    title: string;
    description: string;
    canonical: string;
    h1Count: number;
    textRatio: number;
    html: string;
  }> = [];

  const externalLinks = new Map<string, ExternalLinkRecord>();
  const internalBroken: Array<{ source: string; href: string; status: number }> = [];
  const internalHrefCache = new Map<string, number>();

  for (const path of [...auditPaths].sort()) {
    const pageUrl = new URL(path, `${base}/`).toString();
    let html: string;
    try {
      const res = await fetch(pageUrl, { redirect: "follow" });
      if (!res.ok) {
        issues.push({
          level: "error",
          code: "page-status",
          message: `${path} → HTTP ${res.status}`,
          urls: [path],
        });
        continue;
      }
      html = await res.text();
    } catch (error) {
      issues.push({
        level: "error",
        code: "page-fetch",
        message: `${path} fetch failed: ${error instanceof Error ? error.message : error}`,
        urls: [path],
      });
      continue;
    }

    const meta = parsePageMeta(html);
    const ratio = meta.htmlLength > 0 ? meta.textLength / meta.htmlLength : 0;
    pageMetaRows.push({
      path,
      type: classifyPageType(path),
      title: meta.title,
      description: meta.description,
      canonical: meta.canonical,
      h1Count: meta.h1Count,
      textRatio: ratio,
      html,
    });

    if (!meta.title.trim()) {
      issues.push({ level: "error", code: "missing-title", message: `Missing <title>`, urls: [path] });
    }
    if (!meta.description.trim()) {
      issues.push({ level: "warning", code: "missing-description", message: `Missing meta description`, urls: [path] });
    }
    if (meta.h1Count !== 1) {
      issues.push({
        level: "warning",
        code: "h1-count",
        message: `Expected 1 <h1>, found ${meta.h1Count}`,
        urls: [path],
      });
    }
    if (meta.title.length > BROWSER_TITLE_MAX_LENGTH) {
      issues.push({
        level: "warning",
        code: "long-title",
        message: `Title length ${meta.title.length} > ${BROWSER_TITLE_MAX_LENGTH}`,
        urls: [path],
      });
    }
    if (!meta.canonical) {
      issues.push({ level: "warning", code: "missing-canonical", message: `Missing canonical`, urls: [path] });
    }

    for (const href of extractHrefs(html)) {
      const cls = classifyExternalHref(href, siteOrigin);
      if (!cls.external) {
        if (href.startsWith("/") && !href.startsWith("/api") && !href.startsWith("/admin")) {
          const key = href.split("#")[0] ?? href;
          let status = internalHrefCache.get(key);
          if (status === undefined) {
            const check = await checkHref(base, key);
            status = check.status;
            internalHrefCache.set(key, status);
          }
          if (status === 404 || status >= 500 || status === 0) {
            internalBroken.push({ source: path, href: key, status });
          }
        }
        continue;
      }

      const abs = (() => {
        try {
          return new URL(href).toString();
        } catch {
          return href;
        }
      })();

      let record = externalLinks.get(abs);
      if (!record) {
        record = {
          href: abs,
          status: cls.skipHttpCheck ? "skip" : 0,
          sources: new Set(),
          component: guessLinkSourceComponent(abs),
          skipReason: cls.reason,
        };
        externalLinks.set(abs, record);

        if (!cls.skipHttpCheck) {
          try {
            const res = await fetch(abs, { redirect: "follow", method: "GET" });
            record.status = res.status;
          } catch (error) {
            record.status = "error";
            record.error = error instanceof Error ? error.message : String(error);
          }
        }
      }
      record.sources.add(path);
    }
  }

  const descGroups = new Map<string, string[]>();
  for (const row of pageMetaRows) {
    const d = row.description.trim();
    if (!d) continue;
    if (!descGroups.has(d)) descGroups.set(d, []);
    descGroups.get(d)!.push(row.path);
  }
  const duplicateDescriptions = [...descGroups.entries()].filter(([, paths]) => paths.length > 1);

  const longTitles = pageMetaRows
    .filter((r) => r.title.length > BROWSER_TITLE_MAX_LENGTH)
    .sort((a, b) => b.title.length - a.title.length);

  const lowTextRatio = pageMetaRows
    .filter((r) => r.textRatio < 0.08)
    .sort((a, b) => a.textRatio - b.textRatio);

  const brokenExternal = [...externalLinks.values()].filter((row) => {
    if (row.status === "skip") return false;
    if (row.status === "error") return true;
    if (typeof row.status === "number" && (row.status === 404 || row.status >= 500 || row.status === 0)) {
      return true;
    }
    return false;
  });

  const errors = issues.filter((i) => i.level === "error").length + duplicateDescriptions.length;
  const warnings =
    issues.filter((i) => i.level === "warning").length +
    longTitles.length +
    lowTextRatio.length +
    brokenExternal.length;

  console.log(`Pages audited: ${pageMetaRows.length}`);
  console.log(`Errors (approx): ${errors}`);
  console.log(`Warnings (approx): ${warnings}`);
  console.log("-".repeat(80));

  const topIssues: Array<{ label: string; count: number }> = [];
  if (issues.some((i) => i.code.startsWith("robots"))) {
    topIssues.push({ label: "robots.txt issues", count: issues.filter((i) => i.code.startsWith("robots")).length });
  }
  if (brokenExternal.length) topIssues.push({ label: "broken external links (unique)", count: brokenExternal.length });
  if (duplicateDescriptions.length) {
    topIssues.push({ label: "duplicate meta description groups", count: duplicateDescriptions.length });
  }
  if (longTitles.length) topIssues.push({ label: "long title tags", count: longTitles.length });
  if (lowTextRatio.length) topIssues.push({ label: "low text-HTML ratio pages", count: lowTextRatio.length });
  if (internalBroken.length) topIssues.push({ label: "broken internal links", count: internalBroken.length });

  console.log("Top unique causes:");
  for (const item of topIssues.sort((a, b) => b.count - a.count)) {
    console.log(`  • ${item.label}: ${item.count}`);
  }
  console.log("-".repeat(80));

  if (issues.length) {
    console.log("Issues:");
    for (const issue of issues) {
      console.log(`  [${issue.level}] ${issue.code}: ${issue.message}`);
      if (issue.urls?.length) console.log(`    ${issue.urls.join(", ")}`);
    }
    console.log("-".repeat(80));
  }

  if (duplicateDescriptions.length) {
    console.log("Duplicate meta descriptions:");
    for (const [desc, paths] of duplicateDescriptions) {
      console.log(`  group (${paths.length}): ${desc.slice(0, 100)}${desc.length > 100 ? "…" : ""}`);
      for (const p of paths) console.log(`    - ${p}`);
    }
    console.log("-".repeat(80));
  }

  if (longTitles.length) {
    console.log("Long titles:");
    for (const row of longTitles.slice(0, 25)) {
      console.log(`  ${row.title.length} chars | ${row.path}`);
      console.log(`    ${row.title}`);
    }
    console.log("-".repeat(80));
  }

  if (brokenExternal.length) {
    console.log("Broken external links (unique):");
    for (const row of brokenExternal) {
      console.log(`  ${row.href}`);
      console.log(`    status: ${row.status}${row.error ? ` (${row.error})` : ""} | component: ${row.component}`);
      console.log(`    pages: ${[...row.sources].slice(0, 5).join(", ")}${row.sources.size > 5 ? ` +${row.sources.size - 5}` : ""}`);
    }
    console.log("-".repeat(80));
  }

  const skippedExternal = [...externalLinks.values()].filter((r) => r.status === "skip");
  if (skippedExternal.length) {
    console.log(`Skipped external HTTP checks (tel/mailto/WhatsApp): ${skippedExternal.length} unique hrefs`);
  }

  if (lowTextRatio.length) {
    console.log("Low text-HTML ratio (classification):");
    const byType = new Map<string, string[]>();
    for (const row of lowTextRatio) {
      if (!byType.has(row.type)) byType.set(row.type, []);
      byType.get(row.type)!.push(row.path);
    }
    for (const [type, paths] of byType) {
      console.log(`  ${type}: ${paths.length} URLs`);
      for (const p of paths.slice(0, 8)) console.log(`    - ${p}`);
      if (paths.length > 8) console.log(`    … +${paths.length - 8} more`);
    }
    console.log("-".repeat(80));
  }

  if (internalBroken.length) {
    console.log("Broken internal links:");
    for (const row of internalBroken.slice(0, 20)) {
      console.log(`  ${row.source} → ${row.href} (${row.status})`);
    }
    console.log("-".repeat(80));
  }

  const hasBlockingErrors =
    issues.some((i) => i.level === "error") ||
    duplicateDescriptions.length > 0 ||
    brokenExternal.length > 0 ||
    internalBroken.length > 0;

  if (hasBlockingErrors) {
    process.exit(1);
  }

  console.log("No blocking technical SEO issues detected.");
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
