import { buildProductMetaDescription, getCatalogCategoryLabel } from "@/lib/catalog-seo";
import { formatProductDisplayName, formatProductSeoName } from "@/lib/catalog/product-naming";
import { getCategoryVisual } from "@/lib/category-visuals";
import { mediaImageNeedsUnoptimized } from "@/lib/media-image";
import { buildProductDetailContent, type ProductDetailContent } from "@/lib/product-detail-content";
import { toAbsoluteSiteUrl } from "@/lib/site-url";

import type { PublicCatalogProduct } from "./types";

export type PublicProductView = {
  product: PublicCatalogProduct;
  internalTitle: string;
  displayName: string;
  h1: string;
  seoTitle: string;
  seoDescription: string;
  shortDescription: string;
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

export function buildPublicProductView(product: PublicCatalogProduct): PublicProductView {
  const displayName = formatProductDisplayName(product);
  const seoName = formatProductSeoName(product);
  const detailContent = buildProductDetailContent(product);
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
    displayName,
    h1: displayName,
    seoTitle: `Купить ${seoName} в Казахстане | MANSVALVE GROUP`,
    seoDescription: buildProductMetaDescription(displayName),
    shortDescription: product.shortDescription,
    detailContent,
    categoryLabel,
    catalogPath: `/catalog/${product.slug}`,
    canonicalPath,
    canonicalUrl: toAbsoluteSiteUrl(canonicalPath),
    primaryImageUrl: imageUrl,
    primaryImageAlt: imageAlt,
    primaryImageUnoptimized: mediaImageNeedsUnoptimized(imageUrl),
    imageCount: product.images?.length ?? (product.primaryImageUrl ? 1 : 0),
  };
}
