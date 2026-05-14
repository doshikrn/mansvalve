import type { PublicCatalogProduct } from "@/lib/public-catalog";
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
  const descriptionParagraphs = pickDescriptionParagraphs(product, seoPage?.introParagraphs);
  const characteristics = pickCharacteristics(product, seoPage?.characteristics);

  return {
    descriptionParagraphs,
    characteristics,
    standards: seoPage?.standards ?? [],
    benefits: seoPage?.benefits ?? [],
    applications: seoPage?.applications ?? [],
    qualityDocuments: seoPage?.qualityDocuments ?? [],
    supplyTerms: seoPage?.supplyTerms ?? [],
    canonicalPath: seoPage ? `/${seoPage.categorySlug}/${seoPage.slug}` : `/catalog/${product.slug}`,
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
  return [`${product.name}. Категория: ${product.categoryName}.`];
}

function pickCharacteristics(
  product: PublicCatalogProduct,
  generatedCharacteristics: Array<{ label: string; value: string }> | undefined,
): Array<{ label: string; value: string }> {
  const entries = Object.entries(product.specs ?? {})
    .map(([label, value]) => ({ label, value: String(value).trim() }))
    .filter((item) => item.label.trim() && item.value);

  const byLabel = new Map<string, { label: string; value: string }>();
  for (const item of generatedCharacteristics ?? []) {
    byLabel.set(normalizeLabel(item.label), item);
  }
  for (const item of entries) {
    byLabel.set(normalizeLabel(item.label), item);
  }

  if (byLabel.size > 0) return Array.from(byLabel.values());

  return [
    product.model ? { label: "Маркировка", value: product.model } : null,
    product.dn != null ? { label: "Условный проход", value: `DN${product.dn}` } : null,
    product.pn != null ? { label: "Номинальное давление", value: `PN${product.pn}` } : null,
    product.material ? { label: "Материал", value: product.material } : null,
    product.connectionType ? { label: "Тип соединения", value: product.connectionType } : null,
    product.controlType ? { label: "Тип управления", value: product.controlType } : null,
  ].filter((item): item is { label: string; value: string } => Boolean(item));
}

function splitParagraphs(value: string | undefined): string[] {
  return (value ?? "")
    .split(/\n{2,}|\r?\n(?=\S)/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function normalizeLabel(label: string): string {
  return label.trim().toLowerCase().replace(/ё/g, "е");
}
