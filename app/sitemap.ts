import type { MetadataRoute } from "next";

import { getSiteBaseUrl } from "@/lib/site-url";
import {
  getPublicCatalogCategories,
  getPublicCatalogListingProducts,
} from "@/lib/public-catalog";
import { buildPublicProductView } from "@/lib/public-catalog/product-view";
import { CATALOG_LANDING_PAGES } from "@/lib/catalog-seo";
import { catalogCategoryPath, catalogSubcategoryListingHref } from "@/lib/catalog-routes";
import { isCatalogRedirectSourcePath, isLandingRedirectOnlyPath } from "@/lib/catalog-path-redirects";
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

function shouldIncludeCatalogPath(path: string): boolean {
  if (isCatalogRedirectSourcePath(path)) return false;
  return true;
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
    getPublicCatalogListingProducts(),
    getPublicCatalogCategories(),
  ]);

  const staticPages: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: absoluteUrl(baseUrl, path),
    lastModified,
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1 : 0.8,
  }));

  const categoryPages: MetadataRoute.Sitemap = categories.flatMap((cat) => {
    const path = catalogCategoryPath(cat.slug);
    if (!shouldIncludeCatalogPath(path)) return [];
    return [
      {
        url: absoluteUrl(baseUrl, path),
        lastModified,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      },
    ];
  });

  const subcategoryPages: MetadataRoute.Sitemap = categories.flatMap((cat) =>
    cat.subcategories.flatMap((sub) => {
      const listingPath = catalogSubcategoryListingHref(cat.slug, sub.slug);
      if (!shouldIncludeCatalogPath(listingPath)) return [];

      return [
        {
          url: absoluteUrl(baseUrl, listingPath),
          lastModified,
          changeFrequency: "weekly" as const,
          priority: 0.78,
        },
      ];
    }),
  );

  const landingPages: MetadataRoute.Sitemap = CATALOG_LANDING_PAGES.flatMap((page) => {
    const path = `/${page.categorySlug}/${page.slug}`;
    if (isLandingRedirectOnlyPath(path)) return [];

    const category = categories.find(
      (cat) => cat.id === page.filters.categoryId || cat.slug === page.categorySlug,
    );
    if (!category) return [];

    return [
      {
        url: absoluteUrl(baseUrl, path),
        lastModified,
        changeFrequency: "weekly" as const,
        priority: 0.85,
      },
    ];
  });

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
