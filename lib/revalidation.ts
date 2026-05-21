/**
 * Lets Next finish scheduling path invalidations before a server action redirects
 * or returns a new RSC payload. This keeps the app static/ISR-friendly.
 */
export async function settleRevalidation(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}
