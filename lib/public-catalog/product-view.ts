import { buildProductMetaDescription, getCatalogCategoryLabel } from "@/lib/catalog-seo";
import { formatProductDisplayName, formatProductSeoName } from "@/lib/catalog/product-naming";
import { getCategoryVisual } from "@/lib/category-visuals";
import { mediaImageNeedsUnoptimized } from "@/lib/media-image";
import { buildProductDetailContent, type ProductDetailContent } from "@/lib/product-detail-content";
import { getSeriesSeoPageForProduct } from "@/lib/seo-product-pages/product-series";
import { toAbsoluteSiteUrl } from "@/lib/site-url";

import type { PublicCatalogProduct } from "./types";

/** Section bullets on the public product page (contract names; same data as in `detailContent`). */
export type PublicProductContentSections = {
  standards: string[];
  advantages: string[];
  application: string[];
  documentsQuality: string[];
  deliveryTerms: string[];
};

export type PublicProductView = {
  product: PublicCatalogProduct;
  internalTitle: string;
  generatedDisplayName: string;
  displayName: string;
  h1: string;
  seoTitle: string;
  seoDescription: string;
  shortDescription: string;
  /** Full body copy after paragraph resolution (`\n\n` between paragraphs). */
  fullDescription: string;
  contentSections: PublicProductContentSections;
  detailContent: ProductDetailContent;
  categoryLabel: string;
  /** Legacy listing path; public product links must use `canonicalPath` / `canonicalUrl`. */
  catalogPath: string;
  canonicalPath: string;
  canonicalUrl: string;
  primaryImageUrl: string;
  primaryImageAlt: string;
  primaryImageUnoptimized: boolean;
  imageCount: number;
};

/**
 * Единственная точка принятия решений для публичного товара: имя, H1, описания,
 * SEO (без ручных override-полей), изображение, canonical и секции контента.
 */
export function buildPublicProductView(product: PublicCatalogProduct): PublicProductView {
  const generatedDisplayName = formatProductDisplayName(product);
  const publicTitle = product.publicTitle?.trim();
  const h1Override = product.h1Override?.trim();
  const seriesPage = getSeriesSeoPageForProduct(product);
  const displayName = publicTitle || seriesPage?.title || generatedDisplayName;
  const h1 = h1Override || seriesPage?.h1 || publicTitle || generatedDisplayName;
  const seoName = publicTitle || seriesPage?.title || formatProductSeoName(product);
  const detailContent = buildProductDetailContent(product);
  const fullDescription = detailContent.descriptionParagraphs.join("\n\n");
  const contentSections: PublicProductContentSections = {
    standards: detailContent.standards,
    advantages: detailContent.benefits,
    application: detailContent.applications,
    documentsQuality: detailContent.qualityDocuments,
    deliveryTerms: detailContent.supplyTerms,
  };
  const categoryLabel = getCatalogCategoryLabel(product.category, product.categoryName);
  const categoryVisual = getCategoryVisual(product.category);
  const imageUrl = product.primaryImageUrl || product.images?.[0]?.url || categoryVisual.imageSrc;
  const imageAlt =
    product.primaryImageAlt ||
    product.images?.[0]?.alt ||
    `${categoryLabel} - ${displayName}`;

  const canonicalPath = detailContent.canonicalPath;

  return {
    product,
    internalTitle: product.name,
    generatedDisplayName,
    displayName,
    h1,
    seoTitle: seriesPage?.seoTitle ?? `Купить ${seoName} в Казахстане | MANSVALVE GROUP`,
    seoDescription: seriesPage?.seoDescription ?? buildProductMetaDescription(displayName),
    shortDescription: product.shortDescription || detailContent.descriptionParagraphs[0] || "",
    fullDescription,
    contentSections,
    detailContent,
    categoryLabel,
    catalogPath: `/catalog/${product.slug}`,
    canonicalPath,
    canonicalUrl: toAbsoluteSiteUrl(canonicalPath),
    primaryImageUrl: imageUrl,
    primaryImageAlt: product.primaryImageAlt || product.images?.[0]?.alt || seriesPage?.imageAlt || imageAlt,
    primaryImageUnoptimized: mediaImageNeedsUnoptimized(imageUrl),
    imageCount: product.images?.length ?? (product.primaryImageUrl ? 1 : 0),
  };
}
