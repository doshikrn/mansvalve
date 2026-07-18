import { formatProductPageTitle } from "@/lib/catalog/product-seo-naming";
import { buildPublicProductView } from "@/lib/public-catalog/product-view";
import type { PublicCatalogProduct } from "@/lib/public-catalog/types";

export type ProductPreviewDraftInput = {
  name: string;
  publicTitle: string;
  h1Override: string;
  seoTitleOverride?: string;
  seoDescriptionOverride?: string;
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
  seoTitleIsManual: boolean;
  seoDescription: string;
  seoDescriptionIsManual: boolean;
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
  const view = buildPublicProductView(product);
  return {
    generatedDisplayName: view.generatedDisplayName,
    displayName: view.displayName,
    h1: view.h1,
    h1IsManual: view.h1IsManual,
    shortDescription: view.shortDescription,
    seoTitle: view.seoTitle,
    seoTitleFull: formatProductPageTitle(view.seoTitle, {
      preserveInput: view.seoTitleIsManual,
    }),
    seoTitleIsManual: view.seoTitleIsManual,
    seoDescription: view.seoDescription,
    seoDescriptionIsManual: view.seoDescriptionIsManual,
    canonicalPath: view.canonicalPath,
    canonicalUrl: view.canonicalUrl,
    primaryImageUrl: view.primaryImageUrl,
    primaryImageAlt: view.primaryImageAlt,
    imageCount: input.imageCount ?? 0,
  };
}

function toDraftPublicProduct(input: ProductPreviewDraftInput): PublicCatalogProduct {
  return {
    id: "draft",
    name: input.name.trim() || "Товар",
    publicTitle: input.publicTitle.trim() || undefined,
    h1Override: input.h1Override.trim() || undefined,
    seoTitleOverride: input.seoTitleOverride?.trim() || undefined,
    seoDescriptionOverride: input.seoDescriptionOverride?.trim() || undefined,
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
    primaryImageUrl: input.primaryImageUrl?.trim() || undefined,
    primaryImageAlt: input.primaryImageAlt?.trim() || undefined,
  };
}
