/**
 * Fetches public HTML and prints <title>, meta description, and <h1> count.
 *
 * Usage:
 *   1) npm run start   # in another terminal, production or dev
 *   2) npm run seo:audit
 *
 * Base URL: `SEO_AUDIT_BASE_URL` or `SITE_URL` or `http://localhost:3000`.
 * Optional extra paths: `SEO_AUDIT_EXTRA_PATHS` (comma-separated), e.g.
 *   SEO_AUDIT_EXTRA_PATHS="/catalog/elektroprivod-...,/catalog/category/zadvizhki" npm run seo:audit
 */

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

function extractTitle(html: string): string {
  return html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.replace(/\s+/g, " ")?.trim() ?? "";
}

function extractDescription(html: string): string {
  const m1 = html.match(
    /<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i,
  );
  if (m1?.[1]) return m1[1].trim();
  const m2 = html.match(
    /<meta[^>]+content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i,
  );
  return m2?.[1]?.trim() ?? "";
}

function countH1(html: string): number {
  const bodyStart = html.search(/<body[^>]*>/i);
  const tail = bodyStart === -1 ? html : html.slice(bodyStart);
  return (tail.match(/<h1[\s>]/gi) ?? []).length;
}

type AuditResult =
  | { ok: true; path: string; title: string; description: string; h1Count: number }
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
  return {
    path,
    ok: true,
    title: extractTitle(html) || "— (empty) —",
    description: extractDescription(html) || "— (empty) —",
    h1Count: countH1(html),
  };
}

async function main() {
  const base = getBaseUrl();
  const paths = [...STATIC_PATHS, ...extraPaths()];

  console.log(`Base: ${base}`);
  console.log("—".repeat(100));

  const rows: string[][] = [];
  for (const path of paths) {
    const result = await auditPath(base, path);
    if (!result.ok) {
      rows.push([result.path, "ERROR", result.error, "—"]);
      continue;
    }
    rows.push([
      result.path,
      result.title.slice(0, 80) + (result.title.length > 80 ? "…" : ""),
      result.description.slice(0, 100) + (result.description.length > 100 ? "…" : ""),
      String(result.h1Count),
    ]);
  }

  const w = [28, 52, 58, 5];
  console.log(
    `${pad("path", w[0])} ${pad("title", w[1])} ${pad("description", w[2])} ${pad("h1", w[3])}`,
  );
  for (const row of rows) {
    console.log(
      `${pad(row[0], w[0])} ${pad(row[1], w[1])} ${pad(row[2], w[2])} ${pad(row[3], w[3])}`,
    );
  }
  console.log("—".repeat(100));
  const badH1 = rows.filter((r) => r[3] !== "1" && r[1] !== "ERROR");
  if (badH1.length) {
    console.warn("Expected exactly one <h1> on each page. Check rows where h1 ≠ 1.");
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
