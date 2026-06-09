import { getCatalogCategoryLabel } from "@/lib/catalog-seo";
import { formatProductDisplayName } from "@/lib/catalog/product-naming";
import {
  buildProductSeoTitleFromSource,
  resolveProductAutoH1,
  resolveProductSourceTitle,
} from "@/lib/catalog/product-seo-naming";
import { getCategoryVisual } from "@/lib/category-visuals";
import { mediaImageNeedsUnoptimized } from "@/lib/media-image";
import { buildProductDetailContent, type ProductDetailContent } from "@/lib/product-detail-content";
import { getSeriesSeoPageForProduct } from "@/lib/seo-product-pages/product-series";
import { toAbsoluteSiteUrl } from "@/lib/site-url";
import { catalogCategoryPath } from "@/lib/catalog-routes";
import { normalizeMetaDescription } from "@/lib/seo/metadata";

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

export type PublicProductCardView = {
  displayName: string;
  canonicalPath: string;
  primaryImageUrl: string;
  primaryImageAlt: string;
  primaryImageUnoptimized: boolean;
  categoryLabel: string;
  shortDescription: string;
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
  const h1 = h1Override || seriesPage?.h1 || resolveProductAutoH1(product);
  const sourceTitle = resolveProductSourceTitle(product);
  const detailContent = buildProductDetailContent(product, seriesPage);
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
    seoTitle: buildProductSeoTitleFromSource(sourceTitle, seriesPage?.seoTitle),
    seoDescription: buildProductSeoDescription(
      product,
      sourceTitle,
      seriesPage?.seoDescription,
    ),
    shortDescription: product.shortDescription || detailContent.descriptionParagraphs[0] || "",
    fullDescription,
    contentSections,
    detailContent,
    categoryLabel,
    catalogPath: catalogCategoryPath(product.category),
    canonicalPath,
    canonicalUrl: toAbsoluteSiteUrl(canonicalPath),
    primaryImageUrl: imageUrl,
    primaryImageAlt: product.primaryImageAlt || product.images?.[0]?.alt || seriesPage?.imageAlt || imageAlt,
    primaryImageUnoptimized: mediaImageNeedsUnoptimized(imageUrl),
    imageCount: product.images?.length ?? (product.primaryImageUrl ? 1 : 0),
  };
}

/** Карточка каталога / автодополнение: без полной SEO-сборки `PublicProductView`. */
export function buildPublicProductCardView(product: PublicCatalogProduct): PublicProductCardView {
  const seriesPage = getSeriesSeoPageForProduct(product);
  const detailContent = buildProductDetailContent(product, seriesPage);
  const generatedDisplayName = formatProductDisplayName(product);
  const publicTitle = product.publicTitle?.trim();
  const displayName = publicTitle || seriesPage?.title || generatedDisplayName;
  const categoryLabel = getCatalogCategoryLabel(product.category, product.categoryName);
  const categoryVisual = getCategoryVisual(product.category);
  const imageUrl = product.primaryImageUrl || product.images?.[0]?.url || categoryVisual.imageSrc;
  const imageAlt =
    product.primaryImageAlt ||
    product.images?.[0]?.alt ||
    `${categoryLabel} - ${displayName}`;
  const shortDescription =
    (product.shortDescription && product.shortDescription.trim()) ||
    detailContent.descriptionParagraphs[0] ||
    "";

  return {
    displayName,
    canonicalPath: detailContent.canonicalPath,
    primaryImageUrl: imageUrl,
    primaryImageAlt: product.primaryImageAlt || product.images?.[0]?.alt || seriesPage?.imageAlt || imageAlt,
    primaryImageUnoptimized: mediaImageNeedsUnoptimized(imageUrl),
    categoryLabel,
    shortDescription,
  };
}

function buildProductSeoDescription(
  product: PublicCatalogProduct,
  compactName: string,
  manualDescription?: string,
): string {
  if (manualDescription && manualDescription.replace(/\s+/g, " ").trim().length <= 160) {
    return normalizeMetaDescription(manualDescription);
  }

  const deliveryRegion =
    product.category === "flansy-i-otvody" ? "по Казахстану" : "по РК";

  return normalizeMetaDescription(
    `${compactName} с поставкой ${deliveryRegion}. КП в рабочее время, НДС, сертификаты, паспорт изделия и доставка.`,
  );
}

