import { getSiteBaseUrl } from "@/lib/site-url";

/** Plain-text robots.txt body served at `/robots.txt`. */
export function buildRobotsTxtBody(baseUrl = getSiteBaseUrl()): string {
  const sitemap = `${baseUrl.replace(/\/+$/, "")}/sitemap.xml`;

  return [
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin/",
    "Disallow: /api/",
    "",
    `Sitemap: ${sitemap}`,
    "",
  ].join("\n");
}
