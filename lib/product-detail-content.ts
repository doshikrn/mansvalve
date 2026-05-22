import type { PublicCatalogProduct } from "@/lib/public-catalog";
import { catalogNestedProductPath } from "@/lib/catalog-routes";
import { formatProductDisplayName } from "@/lib/catalog/product-naming";
import { normalizeProductDetailBlocks } from "@/lib/product-detail-blocks";
import {
  getSeriesPagePath,
  getSeriesSeoPageForProduct,
} from "@/lib/seo-product-pages/product-series";

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

/** @see buildPublicProductView — единая точка входа для публичного слоя. */
export function buildProductDetailContent(
  product: PublicCatalogProduct,
  cachedSeriesPage?: ReturnType<typeof getSeriesSeoPageForProduct>,
): ProductDetailContent {
  const seoPage = cachedSeriesPage ?? getSeriesSeoPageForProduct(product);
  const canonicalPath = resolveProductCanonicalPath(product, seoPage);
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
    canonicalPath,
  };
}

function resolveProductCanonicalPath(
  product: PublicCatalogProduct,
  seoPage: ReturnType<typeof getSeriesSeoPageForProduct>,
): string {
  if (seoPage) return getSeriesPagePath(seoPage);
  if (product.category === "klapany" && product.subcategory?.trim()) {
    return catalogNestedProductPath("klapany", product.subcategory, product.slug);
  }
  return `/tovar/${product.slug}`;
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
  const adminEntries = Object.entries(product.specs ?? {})
    .map(([label, value]) => ({ label, value: String(value).trim() }))
    .filter((item) => item.label.trim() && item.value);

  return mergeCharacteristics(
    buildCoreCharacteristics(product),
    generatedCharacteristics ?? [],
    adminEntries,
  );
}

function buildCoreCharacteristics(
  product: PublicCatalogProduct,
): Array<{ label: string; value: string }> {
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

function mergeCharacteristics(
  ...groups: Array<Array<{ label: string; value: string }>>
): Array<{ label: string; value: string }> {
  const merged: Array<{ label: string; value: string }> = [];
  const indexByKey = new Map<string, number>();

  for (const group of groups) {
    for (const item of group) {
      const label = item.label.trim();
      const value = item.value.trim();
      if (!label || !value) continue;

      const key = normalizeCharacteristicKey(label);
      const existingIndex = indexByKey.get(key);
      if (existingIndex == null) {
        indexByKey.set(key, merged.length);
        merged.push({ label, value });
      } else {
        merged[existingIndex] = { label, value };
      }
    }
  }

  return merged;
}

function normalizeCharacteristicKey(label: string): string {
  const normalized = label
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^a-zа-я0-9]+/g, "");

  if (normalized === "dn" || normalized.includes("условныйпроход") || normalized.startsWith("ду")) {
    return "dn";
  }
  if (
    normalized === "pn" ||
    normalized.includes("номинальноедавление") ||
    normalized.startsWith("ру")
  ) {
    return "pn";
  }
  if (normalized.includes("маркиров") || normalized.includes("марка") || normalized === "model") {
    return "model";
  }
  if (normalized.includes("материал")) {
    return "material";
  }
  if (normalized.includes("соедин") || normalized.includes("присоедин")) {
    return "connection";
  }
  if (normalized.includes("управ")) {
    return "control";
  }

  return normalized;
}
function splitParagraphs(value: string | undefined): string[] {
  return (value ?? "")
    .split(/\n{2,}|\r?\n(?=\S)/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}
