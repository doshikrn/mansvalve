export function isMediaUrlValid(url: string | null | undefined): boolean {
  if (!url) return false;
  const value = url.trim();
  if (!value) return false;

  return (
    value.startsWith("/") ||
    value.startsWith("//") ||
    value.startsWith("http://") ||
    value.startsWith("https://")
  );
}

export function warnInvalidMediaUrl(
  url: string | null | undefined,
  context: string,
): void {
  if (process.env.NODE_ENV === "production") return;
  if (isMediaUrlValid(url)) return;
  console.warn("[media:url] invalid or empty media url", { context, url });
}
