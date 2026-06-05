import type { MetadataRoute } from "next";

import { getSiteBaseUrl } from "@/lib/site-url";
import {
  getPublicCatalogCategories,
  getPublicCatalogListingProducts,
} from "@/lib/public-catalog";
import { buildPublicProductView } from "@/lib/public-catalog/product-view";
import { CATALOG_LANDING_PAGES } from "@/lib/catalog-seo";
import { catalogCategoryPath, catalogSubcategoryPath } from "@/lib/catalog-routes";
import {
  findSeriesCatalogProduct,
  getSeriesPagePath,
  PRODUCT_SERIES_SEO_PAGES,
} from "@/lib/seo-product-pages/product-series";

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

/**
 * Subcategories whose canonical points elsewhere (cross-canonical via
 * `SUBCATEGORY_CANONICAL_OVERRIDES` in `CatalogSubcategoryPage`). They stay
 * live but must not appear in the sitemap — only the canonical landing does.
 * Keep in sync with that override map.
 */
const CROSS_CANONICAL_SUBCATEGORY_PATHS = new Set<string>([
  catalogSubcategoryPath("zadvizhki", "zadvizhki-s-elektroprivodom"),
]);

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
    getPublicCatalogListingProducts(),
    getPublicCatalogCategories(),
  ]);

  const staticPages: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: absoluteUrl(baseUrl, path),
    lastModified,
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1 : 0.8,
  }));

  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: absoluteUrl(baseUrl, catalogCategoryPath(cat.slug)),
    lastModified,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const subcategoryPages: MetadataRoute.Sitemap = categories.flatMap((cat) =>
    cat.subcategories
      .map((sub) => catalogSubcategoryPath(cat.slug, sub.slug))
      .filter((path) => !CROSS_CANONICAL_SUBCATEGORY_PATHS.has(path))
      .map((path) => ({
        url: absoluteUrl(baseUrl, path),
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

  const seriesSeoPages: MetadataRoute.Sitemap = PRODUCT_SERIES_SEO_PAGES.filter((page) =>
    findSeriesCatalogProduct(products, page),
  ).map((page) => ({
    url: absoluteUrl(baseUrl, getSeriesPagePath(page)),
    lastModified,
    changeFrequency: "weekly",
    priority: 0.82,
  }));

  const productPages: MetadataRoute.Sitemap = products.map((product) => {
    const view = buildPublicProductView(product);
    return {
      url: absoluteUrl(baseUrl, view.canonicalPath),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
    };
  });

  return uniqueSitemapEntries([
    ...staticPages,
    ...landingPages,
    ...seriesSeoPages,
    ...categoryPages,
    ...subcategoryPages,
    ...productPages,
  ]);
}
