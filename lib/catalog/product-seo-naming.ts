import { COMPANY_BRAND_SEO } from "@/lib/company";
import {
  buildBrowserTitleFromPart,
  clampMetaTextAtWord,
  normalizeMetaTitle,
  stripBrandFromTitle,
  TITLE_PART_MAX_LENGTH,
} from "@/lib/seo/metadata";

import { formatProductDisplayName, type ProductNamingInput } from "./product-naming";

export type ProductSeoNamingInput = ProductNamingInput & {
  publicTitle?: string | null;
};

const PRODUCT_TITLE_SUFFIX = " — купить в Казахстане";

/** Публичное имя для SEO title: publicTitle → generated → name. */
export function resolveProductSourceTitle(input: ProductSeoNamingInput): string {
  const publicTitle = input.publicTitle?.trim();
  if (publicTitle) return publicTitle;

  const generated = formatProductDisplayName(input).trim();
  if (generated) return generated;

  return (input.name ?? "").trim();
}

/** Автоматический H1 без ручного override: publicTitle → generated display name. */
export function resolveProductAutoH1(input: ProductSeoNamingInput): string {
  const publicTitle = input.publicTitle?.trim();
  if (publicTitle) return publicTitle;
  return formatProductDisplayName(input).trim();
}

/**
 * Часть `<title>` до template layout (`%s | MANSVALVE GROUP`).
 * Полный tab title: `formatProductPageTitle(part)`.
 */
export function buildProductAutoMetaTitlePart(productTitle: string): string {
  const trimmed = productTitle.trim();
  if (!trimmed) {
    return normalizeMetaTitle("Купить в Казахстане");
  }

  const maxNameLen = TITLE_PART_MAX_LENGTH - PRODUCT_TITLE_SUFFIX.length;
  const namePart =
    maxNameLen >= 8 ? trimProductNameForTitle(trimmed, maxNameLen) : trimmed;
  return normalizeMetaTitle(`${namePart}${PRODUCT_TITLE_SUFFIX}`);
}

/** Полный title страницы товара, как в браузере (с брендом из root template). */
export function formatProductPageTitle(titlePart: string): string {
  const part = titlePart.trim();
  if (!part) return COMPANY_BRAND_SEO;
  if (stripBrandFromTitle(part).length !== part.length) return part;
  return buildBrowserTitleFromPart(part);
}

export function normalizeComparableTitle(value: string | null | undefined): string {
  return (value ?? "")
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/\s+/g, " ")
    .trim();
}

/** `h1_override` совпадает с auto-кандидатом и может быть очищен. */
export function isAutoLikeH1Override(
  h1Override: string | null | undefined,
  candidates: Array<string | null | undefined>,
): boolean {
  const normalized = normalizeComparableTitle(h1Override);
  if (!normalized) return false;
  return candidates.some(
    (candidate) => candidate && normalizeComparableTitle(candidate) === normalized,
  );
}

export function buildProductSeoTitleFromSource(
  sourceTitle: string,
  manualTitle?: string | null,
): string {
  const manual = manualTitle?.trim();
  if (manual && stripBrandFromTitle(manual).length > 0) {
    return normalizeMetaTitle(manual);
  }
  return buildProductAutoMetaTitlePart(sourceTitle);
}

/** Сохраняет DN/PN/модель в конце при укорочении длинного названия. */
function trimProductNameForTitle(name: string, maxLen: number): string {
  if (name.length <= maxLen) return name;

  const specTokens = [...name.matchAll(/\b(?:DN\d+|PN\d+|30[а-яa-z0-9]+)\b/gi)].map(
    (m) => m[0],
  );
  const tail = [...new Set(specTokens)].slice(-2).join(" ");

  if (tail && tail.length + 1 < maxLen) {
    const headMax = maxLen - tail.length - 1;
    const head = clampMetaTextAtWord(name, headMax);
    return `${head} ${tail}`.trim();
  }

  return clampMetaTextAtWord(name, maxLen);
}
