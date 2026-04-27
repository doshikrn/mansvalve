/**
 * Remote / protocol-relative URLs use the Next Image component without
 * a host allowlist in next.config; match MediaUpload / ProductCard pattern.
 */
export function mediaImageNeedsUnoptimized(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://") || url.startsWith("//");
}
