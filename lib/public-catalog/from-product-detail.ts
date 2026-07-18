import type { PublicCatalogProduct } from "@/lib/public-catalog/types";
import type { ProductDetail } from "@/lib/services/products";

export function productDetailToPublicCatalogProduct(
  product: ProductDetail,
): PublicCatalogProduct {
  return {
    id: String(product.id),
    externalId: product.externalId ?? undefined,
    name: product.name,
    publicTitle: product.publicTitle ?? undefined,
    h1Override: product.h1Override ?? undefined,
    seoTitleOverride: product.seoTitleOverride ?? undefined,
    seoDescriptionOverride: product.seoDescriptionOverride ?? undefined,
    slug: product.slug,
    category: product.categorySlug,
    subcategory: product.subcategorySlug ?? "",
    subcategoryName: product.subcategoryName ?? "",
    categoryName: product.categoryName,
    dn: product.dn ?? undefined,
    pn: product.pn ?? undefined,
    thread: product.thread ?? undefined,
    material: product.material ?? "",
    connectionType: product.connectionType ?? "",
    controlType: product.controlType ?? "",
    model: product.model ?? "",
    price: product.price == null ? undefined : Number(product.price),
    priceByRequest: product.priceByRequest,
    weight: product.weight == null ? undefined : Number(product.weight),
    specs: Object.fromEntries(product.specs.map((spec) => [spec.key, spec.value])),
    shortDescription: product.shortDescription ?? "",
    longDescription: product.longDescription ?? undefined,
    detailBlocks: product.detailBlocks ?? undefined,
    primaryImageUrl:
      product.images.find((image) => image.isPrimary)?.url ?? product.images[0]?.url,
    primaryImageAlt:
      product.images.find((image) => image.isPrimary)?.alt ??
      product.images[0]?.alt ??
      undefined,
    images: product.images.map((image) => ({
      url: image.url,
      alt: image.alt ?? "",
      isPrimary: image.isPrimary,
      sortOrder: image.sortOrder,
    })),
    documents: {
      specification: product.documents.specification
        ? {
            url: product.documents.specification.url,
            mimeType: product.documents.specification.mimeType,
            sizeBytes: product.documents.specification.sizeBytes,
            label: product.documents.specification.alt ?? undefined,
          }
        : undefined,
      questionnaire: product.documents.questionnaire
        ? {
            url: product.documents.questionnaire.url,
            mimeType: product.documents.questionnaire.mimeType,
            sizeBytes: product.documents.questionnaire.sizeBytes,
            label: product.documents.questionnaire.alt ?? undefined,
          }
        : undefined,
      documentation: product.documents.documentation
        ? {
            url: product.documents.documentation.url,
            mimeType: product.documents.documentation.mimeType,
            sizeBytes: product.documents.documentation.sizeBytes,
            label: product.documents.documentation.alt ?? undefined,
          }
        : undefined,
    },
  };
}
