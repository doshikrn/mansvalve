import { formatProductDisplayName } from "@/lib/catalog/product-naming";
import {
  buildProductSeoDescription,
  buildProductSeoTitleFromSource,
  formatProductPageTitle,
  resolveProductAutoH1,
  resolveProductSourceTitle,
} from "@/lib/catalog/product-seo-naming";
import { getCategoryVisual } from "@/lib/category-visuals";
import { toAbsoluteSiteUrl } from "@/lib/site-url";
import { getSeriesSeoPageForProduct } from "@/lib/seo-product-pages/product-series";
import type { PublicCatalogProduct } from "@/lib/public-catalog/types";

export type ProductPreviewDraftInput = {
  name: string;
  publicTitle: string;
  h1Override: string;
  slug: string;
  categorySlug: string;
  categoryName: string;
  subcategorySlug?: string;
  subcategoryName?: string;
  model?: string;
  dn?: number | null;
  pn?: number | null;
  material?: string;
  connectionType?: string;
  controlType?: string;
  shortDescription?: string;
  primaryImageUrl?: string;
  primaryImageAlt?: string;
  imageCount?: number;
};

export type ProductPreviewDraftResult = {
  generatedDisplayName: string;
  displayName: string;
  h1: string;
  h1IsManual: boolean;
  shortDescription: string;
  seoTitle: string;
  seoTitleFull: string;
  seoDescription: string;
  canonicalPath: string;
  canonicalUrl: string;
  primaryImageUrl: string;
  primaryImageAlt: string;
  imageCount: number;
};

/** Клиентский предпросмотр формы товара — те же правила, что `buildPublicProductView()`. */
export function buildProductPreviewFromDraft(
  input: ProductPreviewDraftInput,
): ProductPreviewDraftResult {
  const product = toDraftPublicProduct(input);
  const seriesPage = getSeriesSeoPageForProduct(product);
  const generatedDisplayName = formatProductDisplayName(product);
  const publicTitle = input.publicTitle.trim();
  const h1Override = input.h1Override.trim();
  const displayName = publicTitle || seriesPage?.title || generatedDisplayName;
  const h1 = h1Override || seriesPage?.h1 || resolveProductAutoH1(product);
  const sourceTitle = resolveProductSourceTitle(product);
  const seoTitlePart = buildProductSeoTitleFromSource(
    sourceTitle,
    seriesPage?.seoTitle,
    product,
  );
  const categoryVisual = getCategoryVisual(product.category);
  const imageUrl = input.primaryImageUrl?.trim() || categoryVisual.imageSrc;
  const imageAlt =
    input.primaryImageAlt?.trim() ||
    `${product.categoryName} - ${displayName}`;
  const canonicalPath = `/tovar/${input.slug.trim() || "preview"}`;
  const shortDescription = input.shortDescription?.trim() ?? "";

  return {
    generatedDisplayName,
    displayName,
    h1,
    h1IsManual: Boolean(h1Override),
    shortDescription,
    seoTitle: seoTitlePart,
    seoTitleFull: formatProductPageTitle(seoTitlePart),
    seoDescription: buildProductSeoDescription(product, sourceTitle, seriesPage?.seoDescription),
    canonicalPath,
    canonicalUrl: toAbsoluteSiteUrl(canonicalPath),
    primaryImageUrl: imageUrl,
    primaryImageAlt: imageAlt,
    imageCount: input.imageCount ?? 0,
  };
}

function toDraftPublicProduct(input: ProductPreviewDraftInput): PublicCatalogProduct {
  return {
    id: "draft",
    name: input.name.trim() || "Товар",
    publicTitle: input.publicTitle.trim() || undefined,
    h1Override: input.h1Override.trim() || undefined,
    slug: input.slug.trim() || "preview",
    category: input.categorySlug || "catalog",
    subcategory: input.subcategorySlug ?? "",
    subcategoryName: input.subcategoryName ?? "",
    categoryName: input.categoryName || "Каталог",
    dn: input.dn ?? undefined,
    pn: input.pn ?? undefined,
    thread: undefined,
    material: input.material ?? "",
    connectionType: input.connectionType ?? "",
    controlType: input.controlType ?? "",
    model: input.model ?? "",
    price: undefined,
    priceByRequest: true,
    weight: undefined,
    specs: {},
    shortDescription: input.shortDescription ?? "",
  };
}
