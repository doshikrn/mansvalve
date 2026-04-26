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

export function getSiteBaseUrl(): string {
  const explicitBaseUrl = normalizeBaseUrl(process.env.SITE_URL);
  if (explicitBaseUrl) return explicitBaseUrl;

  const vercelBaseUrl = normalizeBaseUrl(process.env.VERCEL_URL);
  if (vercelBaseUrl) return vercelBaseUrl;

  return DEFAULT_BASE_URL;
}
