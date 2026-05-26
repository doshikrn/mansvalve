/**
 * Trusted remote hosts for `next/image` (build-time `remotePatterns` + runtime checks).
 * Only env-derived hostnames — no wildcard for arbitrary external CDNs.
 */

export type RemoteImagePattern = {
  protocol: "http" | "https";
  hostname: string;
  pathname: string;
  port?: string;
};

function parseUrlHostname(raw: string | undefined): string | null {
  if (!raw?.trim()) return null;
  const value = raw.trim();
  const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    return new URL(candidate).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function parseAbsoluteUrl(raw: string | undefined): URL | null {
  if (!raw?.trim()) return null;
  const value = raw.trim();
  if (!/^https?:\/\//i.test(value)) return null;
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

export function isSupabaseStorageHostname(hostname: string): boolean {
  return hostname.toLowerCase().endsWith(".supabase.co");
}

export function isSupabaseStoragePublicPath(pathname: string): boolean {
  return pathname.startsWith("/storage/v1/object/public/");
}

function patternKey(pattern: RemoteImagePattern): string {
  return `${pattern.protocol}://${pattern.hostname}${pattern.pathname}`;
}

function addPattern(
  bucket: RemoteImagePattern[],
  seen: Set<string>,
  pattern: RemoteImagePattern,
): void {
  const key = patternKey(pattern);
  if (seen.has(key)) return;
  seen.add(key);
  bucket.push(pattern);
}

function patternsFromSupabaseUrl(raw: string | undefined): RemoteImagePattern[] {
  const host = parseUrlHostname(raw);
  if (!host || !isSupabaseStorageHostname(host)) return [];
  return [
    {
      protocol: "https",
      hostname: host,
      pathname: "/storage/v1/object/public/**",
    },
  ];
}

function patternsFromMediaPublicBase(raw: string | undefined): RemoteImagePattern[] {
  const base = parseAbsoluteUrl(raw);
  if (!base) return [];

  const hostname = base.hostname.toLowerCase();
  if (isSupabaseStorageHostname(hostname)) {
    return patternsFromSupabaseUrl(base.origin);
  }

  const basePath = base.pathname.replace(/\/$/, "");
  const pathname =
    basePath && basePath !== "/"
      ? `${basePath}/**`
      : "/uploads/**";

  const patterns: RemoteImagePattern[] = [
    { protocol: "https", hostname, pathname },
  ];
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    patterns.push({ protocol: "http", hostname, pathname });
  }
  return patterns;
}

function patternsFromSiteUrl(raw: string | undefined): RemoteImagePattern[] {
  const host = parseUrlHostname(raw);
  if (!host) return [];

  const patterns: RemoteImagePattern[] = [
    {
      protocol: "https",
      hostname: host,
      pathname: "/uploads/**",
    },
  ];
  if (host === "localhost" || host === "127.0.0.1") {
    patterns.push({
      protocol: "http",
      hostname: host,
      pathname: "/uploads/**",
    });
  }
  return patterns;
}

/** Hostnames allowed for remote `next/image` optimization (from env only). */
export function collectTrustedMediaHostnames(): string[] {
  const hosts = new Set<string>();
  for (const raw of [
    process.env.SUPABASE_URL,
    process.env.MEDIA_PUBLIC_BASE_URL,
    process.env.SITE_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
  ]) {
    const host = parseUrlHostname(raw);
    if (host) hosts.add(host);
  }
  return [...hosts];
}

export function buildNextImageRemotePatterns(): RemoteImagePattern[] {
  const patterns: RemoteImagePattern[] = [];
  const seen = new Set<string>();

  for (const pattern of patternsFromSupabaseUrl(process.env.SUPABASE_URL)) {
    addPattern(patterns, seen, pattern);
  }

  for (const pattern of patternsFromMediaPublicBase(process.env.MEDIA_PUBLIC_BASE_URL)) {
    addPattern(patterns, seen, pattern);
  }

  const mediaHost = parseUrlHostname(process.env.MEDIA_PUBLIC_BASE_URL);
  const siteHost = parseUrlHostname(
    process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL,
  );
  if (siteHost && siteHost !== mediaHost) {
    for (const pattern of patternsFromSiteUrl(
      process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL,
    )) {
      addPattern(patterns, seen, pattern);
    }
  }

  return patterns;
}

function urlMatchesMediaPublicBase(parsed: URL): boolean {
  const raw = process.env.MEDIA_PUBLIC_BASE_URL?.trim();
  const base = parseAbsoluteUrl(raw);
  if (!base) return false;
  if (parsed.hostname.toLowerCase() !== base.hostname.toLowerCase()) return false;

  const basePath = base.pathname.replace(/\/$/, "");
  if (!basePath || basePath === "/") {
    return parsed.pathname.length > 1;
  }
  return (
    parsed.pathname === basePath ||
    parsed.pathname.startsWith(`${basePath}/`)
  );
}

function urlMatchesSiteUploads(parsed: URL): boolean {
  const siteHost = parseUrlHostname(
    process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL,
  );
  if (!siteHost || parsed.hostname.toLowerCase() !== siteHost) return false;
  return parsed.pathname.startsWith("/uploads/");
}

/**
 * Absolute http(s) URL that may use the Next image optimizer (must match remotePatterns).
 */
export function isTrustedMediaUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;

  const normalized = trimmed.startsWith("//") ? `https:${trimmed}` : trimmed;
  if (!/^https?:\/\//i.test(normalized)) return false;

  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    return false;
  }

  const hostname = parsed.hostname.toLowerCase();
  const supabaseHost = parseUrlHostname(process.env.SUPABASE_URL);

  if (
    supabaseHost &&
    hostname === supabaseHost &&
    isSupabaseStorageHostname(hostname) &&
    isSupabaseStoragePublicPath(parsed.pathname)
  ) {
    return true;
  }

  if (urlMatchesMediaPublicBase(parsed)) {
    return true;
  }

  if (urlMatchesSiteUploads(parsed)) {
    return true;
  }

  return false;
}
