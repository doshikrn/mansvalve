import type { MetadataRoute } from "next";

import { getSiteBaseUrl } from "@/lib/site-url";
import {
  getPublicCatalogCategories,
  getPublicCatalogProducts,
} from "@/lib/public-catalog";
import { CATALOG_LANDING_PAGES } from "@/lib/catalog-seo";

const STATIC_ROUTES = [
  "/",
  "/catalog",
  "/about",
  "/contacts",
  "/certificates",
  "/delivery",
  "/privacy",
  "/terms",
] as const;

function absoluteUrl(baseUrl: string, path: string): string {
  return new URL(path, `${baseUrl}/`).toString();
}

function uniqueSitemapEntries(entries: MetadataRoute.Sitemap): MetadataRoute.Sitemap {
  const seen = new Set<string>();
  return entries.filter((entry) => {
    if (seen.has(entry.url)) return false;
    seen.add(entry.url);
    return true;
  });
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteBaseUrl();
  const lastModified = new Date();
  const [products, categories] = await Promise.all([
    getPublicCatalogProducts(),
    getPublicCatalogCategories(),
  ]);

  const staticPages: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: absoluteUrl(baseUrl, path),
    lastModified,
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1 : 0.8,
  }));

  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: absoluteUrl(baseUrl, `/catalog/category/${cat.slug}`),
    lastModified,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const subcategoryPages: MetadataRoute.Sitemap = categories.flatMap((cat) =>
    cat.subcategories.map((sub) => ({
      url: absoluteUrl(baseUrl, `/catalog/subcategory/${sub.slug}`),
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    })),
  );

  const landingPages: MetadataRoute.Sitemap = CATALOG_LANDING_PAGES.map((page) => ({
    url: absoluteUrl(baseUrl, `/${page.categorySlug}/${page.slug}`),
    lastModified,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: absoluteUrl(baseUrl, `/catalog/${product.slug}`),
    lastModified,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return uniqueSitemapEntries([
    ...staticPages,
    ...landingPages,
    ...categoryPages,
    ...subcategoryPages,
    ...productPages,
  ]);
}
