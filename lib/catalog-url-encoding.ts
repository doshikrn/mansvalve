/** Percent-encode query for safe `Location` headers and redirect destinations. */
export function encodeRedirectPath(path: string): string {
  const url = new URL(path, "https://mansvalve-group.kz");
  return `${url.pathname}${url.search}${url.hash}`;
}
