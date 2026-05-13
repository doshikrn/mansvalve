/**
 * Validates `returnTo` for admin navigation (open-redirect safe).
 * Only same-origin relative paths under `/admin` are allowed.
 */
export function safeReturnTo(
  value: string | undefined | null,
  fallback: string,
): string {
  if (!value || typeof value !== "string") return fallback;

  let decoded = value.trim();
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    return fallback;
  }

  if (!decoded.startsWith("/") || decoded.startsWith("//")) return fallback;
  if (decoded.length > 2048) return fallback;
  if (decoded.includes("\0")) return fallback;

  const hashIdx = decoded.indexOf("#");
  const withoutHash = hashIdx >= 0 ? decoded.slice(0, hashIdx) : decoded;
  const qIdx = withoutHash.indexOf("?");
  const pathname =
    qIdx >= 0 ? withoutHash.slice(0, qIdx) : withoutHash;
  const search = qIdx >= 0 ? withoutHash.slice(qIdx) : "";

  if (!pathname.startsWith("/admin")) return fallback;
  if (pathname.includes("..") || pathname.includes("\\")) return fallback;
  if (pathname.includes("@")) return fallback;

  return pathname + search;
}

/** Build `?returnTo=` value (pass result of safeReturnTo or a known-safe list URL). */
export function withReturnTo(href: string, returnTo: string): string {
  if (!returnTo) return href;
  const sep = href.includes("?") ? "&" : "?";
  return `${href}${sep}returnTo=${encodeURIComponent(returnTo)}`;
}
