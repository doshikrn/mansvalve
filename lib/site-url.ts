const DEFAULT_BASE_URL = "http://localhost:3000";

function normalizeBaseUrl(value: string | undefined): string | null {
  if (!value) return null;

  const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;

  try {
    const url = new URL(candidate);
    url.pathname = "";
    url.search = "";
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

/**
 * Base URL for absolute links (metadata, sitemap, robots, JSON-LD).
 * Set `SITE_URL` to the public **domain** (e.g. `https://mansvalve-group.kz`), not
 * a bare server IP, or `/sitemap.xml` and `robots.txt` will expose the wrong host.
 */
export function getSiteBaseUrl(): string {
  const explicitBaseUrl = normalizeBaseUrl(process.env.SITE_URL);
  if (explicitBaseUrl) return explicitBaseUrl;

  const vercelBaseUrl = normalizeBaseUrl(process.env.VERCEL_URL);
  if (vercelBaseUrl) return vercelBaseUrl;

  return DEFAULT_BASE_URL;
}
