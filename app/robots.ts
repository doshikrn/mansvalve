import type { MetadataRoute } from "next";

import { getSiteBaseUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteBaseUrl();
  const host = new URL(baseUrl).host;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/*?*",
        ],
      },
      {
        userAgent: "Googlebot-Image",
        allow: [
          "/",
          "/images/",
          "/*.png$",
          "/*.jpg$",
          "/*.jpeg$",
          "/*.webp$",
          "/*.svg$",
        ],
        disallow: [
          "/admin/",
          "/api/",
        ],
      },
    ],
    host,
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
