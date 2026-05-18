import type { PublicCatalogProduct } from "@/lib/public-catalog";
import { formatProductDisplayName } from "@/lib/catalog/product-naming";
import { normalizeProductDetailBlocks } from "@/lib/product-detail-blocks";
import { getGateValveSeoPageForProduct } from "@/lib/seo-product-pages/gate-valves";

export type ProductDetailContent = {
  descriptionParagraphs: string[];
  characteristics: Array<{ label: string; value: string }>;
  standards: string[];
  benefits: string[];
  applications: string[];
  qualityDocuments: string[];
  supplyTerms: string[];
  canonicalPath: string;
};

export function buildProductDetailContent(
  product: PublicCatalogProduct,
): ProductDetailContent {
  const seoPage = getGateValveSeoPageForProduct(product);
  const customBlocks = product.detailBlocks
    ? normalizeProductDetailBlocks(product.detailBlocks)
    : undefined;
  const descriptionParagraphs = pickDescriptionParagraphs(
    product,
    seoPage?.introParagraphs,
  );
  const characteristics = pickCharacteristics(product, seoPage?.characteristics);

  return {
    descriptionParagraphs,
    characteristics,
    standards: customBlocks?.standards ?? seoPage?.standards ?? [],
    benefits: customBlocks?.benefits ?? seoPage?.benefits ?? [],
    applications: customBlocks?.applications ?? seoPage?.applications ?? [],
    qualityDocuments:
      customBlocks?.qualityDocuments ?? seoPage?.qualityDocuments ?? [],
    supplyTerms: customBlocks?.supplyTerms ?? seoPage?.supplyTerms ?? [],
    canonicalPath: seoPage
      ? `/${seoPage.categorySlug}/${seoPage.slug}`
      : `/tovar/${product.slug}`,
  };
}

function pickDescriptionParagraphs(
  product: PublicCatalogProduct,
  generatedParagraphs: string[] | undefined,
): string[] {
  const longDescription = splitParagraphs(product.longDescription);
  if (longDescription.length > 0) return longDescription;
  if (generatedParagraphs?.length) return generatedParagraphs;
  const shortDescription = product.shortDescription.trim();
  if (shortDescription) return [shortDescription];
  const publicName = product.publicTitle?.trim() || formatProductDisplayName(product);
  return [`${publicName}. Категория: ${product.categoryName}.`];
}

function pickCharacteristics(
  product: PublicCatalogProduct,
  generatedCharacteristics: Array<{ label: string; value: string }> | undefined,
): Array<{ label: string; value: string }> {
  const entries = Object.entries(product.specs ?? {})
    .map(([label, value]) => ({ label, value: String(value).trim() }))
    .filter((item) => item.label.trim() && item.value);

  if (entries.length > 0) return entries;
  if (generatedCharacteristics?.length) return generatedCharacteristics;

  return [
    product.model ? { label: "Маркировка", value: product.model } : null,
    product.dn != null
      ? { label: "Условный проход", value: `DN${product.dn}` }
      : null,
    product.pn != null
      ? { label: "Номинальное давление", value: `PN${product.pn}` }
      : null,
    product.material ? { label: "Материал", value: product.material } : null,
    product.connectionType
      ? { label: "Тип соединения", value: product.connectionType }
      : null,
    product.controlType
      ? { label: "Тип управления", value: product.controlType }
      : null,
  ].filter((item): item is { label: string; value: string } => Boolean(item));
}

function splitParagraphs(value: string | undefined): string[] {
  return (value ?? "")
    .split(/\n{2,}|\r?\n(?=\S)/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}
