export type ParsedPageMeta = {
  title: string;
  description: string;
  canonical: string;
  h1Count: number;
  textLength: number;
  htmlLength: number;
};

export function extractTitle(html: string): string {
  return html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.replace(/\s+/g, " ")?.trim() ?? "";
}

export function extractDescription(html: string): string {
  const m1 = html.match(
    /<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i,
  );
  if (m1?.[1]) return m1[1].trim();
  const m2 = html.match(
    /<meta[^>]+content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i,
  );
  return m2?.[1]?.trim() ?? "";
}

export function extractCanonical(html: string): string {
  const m1 = html.match(
    /<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']*)["'][^>]*>/i,
  );
  if (m1?.[1]) return m1[1].trim();
  const m2 = html.match(
    /<link[^>]+href=["']([^"']*)["'][^>]*rel=["']canonical["'][^>]*>/i,
  );
  return m2?.[1]?.trim() ?? "";
}

export function countH1(html: string): number {
  const bodyStart = html.search(/<body[^>]*>/i);
  const tail = bodyStart === -1 ? html : html.slice(bodyStart);
  return (tail.match(/<h1[\s>]/gi) ?? []).length;
}

export function estimateVisibleTextLength(html: string): number {
  const bodyStart = html.search(/<body[^>]*>/i);
  const tail = bodyStart === -1 ? html : html.slice(bodyStart);
  const withoutScripts = tail
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return withoutScripts.length;
}

export function parsePageMeta(html: string): ParsedPageMeta {
  return {
    title: extractTitle(html),
    description: extractDescription(html),
    canonical: extractCanonical(html),
    h1Count: countH1(html),
    textLength: estimateVisibleTextLength(html),
    htmlLength: html.length,
  };
}

export function extractHrefs(html: string): string[] {
  const hrefs = new Set<string>();
  const re = /href=["']([^"'#]+)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    const raw = match[1]?.trim();
    if (raw) hrefs.add(raw);
  }
  return [...hrefs];
}

export function parseSitemapLocs(xml: string): string[] {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]?.trim() ?? "").filter(Boolean);
}

export function pathFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.pathname.replace(/\/+$/, "") || "/"}${parsed.search}`;
  } catch {
    return url;
  }
}
