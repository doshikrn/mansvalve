import { isTrustedMediaUrl } from "@/lib/media-image-trusted-hosts";

function isSvgUrl(url: string): boolean {
  const path = url.split(/[?#]/, 1)[0] ?? url;
  return /\.svgz?$/i.test(path);
}

/**
 * When `true`, `next/image` serves the asset as-is (`unoptimized`).
 *
 * Optimized (returns `false`):
 * - same-origin paths (`/uploads/…`, `/images/…`) — Next reads from `public/`;
 * - Supabase public storage URLs from `SUPABASE_URL` / `MEDIA_PUBLIC_BASE_URL`;
 * - absolute `/uploads/…` on `SITE_URL` host.
 *
 * Stays unoptimized:
 * - unknown external hosts;
 * - SVG, `data:`, `blob:`.
 */
export function mediaImageNeedsUnoptimized(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return true;

  if (/^data:/i.test(trimmed) || /^blob:/i.test(trimmed)) return true;
  if (isSvgUrl(trimmed)) return true;

  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    // Same-origin asset served by Next from `public/` (`/uploads/…`, `/images/…`).
    // SVG / data: are handled above; everything else here is safe to optimize.
    return false;
  }

  if (trimmed.startsWith("//") || /^https?:\/\//i.test(trimmed)) {
    const normalized = trimmed.startsWith("//") ? `https:${trimmed}` : trimmed;
    try {
      const parsed = new URL(normalized);
      if (parsed.pathname.startsWith("/uploads/")) return true;
    } catch {
      return true;
    }
    return !isTrustedMediaUrl(trimmed);
  }

  return true;
}
