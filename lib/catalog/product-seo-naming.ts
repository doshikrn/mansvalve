import { COMPANY_BRAND_SEO } from "@/lib/company";
import {
  clampMetaTextAtWord,
  stripBrandFromTitle,
  TITLE_TEMPLATE_BRAND_SUFFIX,
} from "@/lib/seo/metadata";

import { formatProductDisplayName, type ProductNamingInput } from "./product-naming";

export type ProductSeoNamingInput = ProductNamingInput & {
  publicTitle?: string | null;
};

const PRODUCT_TITLE_SUFFIX = " — купить в Казахстане";
const PRODUCT_BROWSER_TITLE_MAX_LENGTH = 90;
const PRODUCT_TITLE_PART_MAX_LENGTH =
  PRODUCT_BROWSER_TITLE_MAX_LENGTH - TITLE_TEMPLATE_BRAND_SUFFIX.length;

export type ProductSeoIdentityPart = {
  field:
    | "model"
    | "externalId"
    | "dn"
    | "pn"
    | "material"
    | "connectionType"
    | "controlType"
    | "thread";
  value: string;
};

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
export function buildProductAutoMetaTitlePart(
  productTitle: string,
  identity?: ProductSeoNamingInput,
): string {
  const trimmed = stripProductTitleDecorations(productTitle);
  if (!trimmed) {
    return "Купить в Казахстане";
  }

  const identityParts = identity ? getProductSeoIdentityParts(identity) : [];
  const augmented = appendMissingIdentityParts(trimmed, identityParts);
  const maxNameLen = PRODUCT_TITLE_PART_MAX_LENGTH - PRODUCT_TITLE_SUFFIX.length;
  const namePart = trimProductNameForTitle(augmented, maxNameLen, identityParts);
  return `${namePart}${PRODUCT_TITLE_SUFFIX}`;
}

/** Полный title страницы товара, как в браузере (с брендом из root template). */
export function formatProductPageTitle(titlePart: string): string {
  const part = stripBrandFromTitle(titlePart).replace(/\s+/g, " ").trim();
  if (!part) return COMPANY_BRAND_SEO;
  return `${part}${TITLE_TEMPLATE_BRAND_SUFFIX}`;
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
  identity?: ProductSeoNamingInput,
): string {
  const manual = manualTitle?.trim();
  if (manual && stripBrandFromTitle(manual).length > 0) {
    return buildProductAutoMetaTitlePart(manual, identity);
  }
  return buildProductAutoMetaTitlePart(sourceTitle, identity);
}

export function getProductSeoIdentityParts(
  input: ProductSeoNamingInput,
): ProductSeoIdentityPart[] {
  const specs = Array.isArray(input.specs)
    ? Object.fromEntries(input.specs.map((item) => [item.key, item.value]))
    : input.specs ?? {};
  const specModel = Object.entries(specs).find(([key]) => /модел|маркир/i.test(key))?.[1];
  const values: ProductSeoIdentityPart[] = [
    { field: "model", value: meaningfulValue(input.model) || meaningfulValue(specModel) },
    {
      field: "externalId",
      value: meaningfulValue(input.externalId) ? `арт. ${input.externalId!.trim()}` : "",
    },
    { field: "dn", value: input.dn != null ? `DN${input.dn}` : "" },
    { field: "pn", value: input.pn != null ? `PN${input.pn}` : "" },
    { field: "material", value: meaningfulValue(input.material) },
    { field: "connectionType", value: meaningfulValue(input.connectionType) },
    { field: "controlType", value: meaningfulValue(input.controlType) },
    { field: "thread", value: meaningfulValue(input.thread) },
  ];

  const seen = new Set<string>();
  return values.filter((part) => {
    if (!part.value) return false;
    const key = normalizeComparableTitle(part.value);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Сохраняет идентификаторы модели в конце при укорочении длинного названия. */
function trimProductNameForTitle(
  name: string,
  maxLen: number,
  identityParts: ProductSeoIdentityPart[],
): string {
  if (name.length <= maxLen) return name;

  const tailParts: string[] = [];
  for (const part of identityParts) {
    const candidate = [...tailParts, part.value].join(" ");
    if (candidate.length < maxLen - 3) tailParts.push(part.value);
  }
  const tail = tailParts.join(" ");

  if (tail && tail.length + 1 < maxLen) {
    const headMax = maxLen - tail.length - 1;
    const head = clampMetaTextAtWord(name, headMax);
    return `${head} ${tail}`.trim();
  }

  return clampMetaTextAtWord(name, maxLen);
}

function appendMissingIdentityParts(
  title: string,
  identityParts: ProductSeoIdentityPart[],
): string {
  let result = title;
  for (const part of identityParts) {
    if (!normalizeComparableTitle(result).includes(normalizeComparableTitle(part.value))) {
      result = `${result} ${part.value}`;
    }
  }
  return result.replace(/\s+/g, " ").trim();
}

function stripProductTitleDecorations(value: string): string {
  return stripBrandFromTitle(value)
    .replace(/\s+[—-]\s*купить\s+в\s+Казахстане\s*$/iu, "")
    .replace(/[…]+$/u, "")
    .replace(/\s+/g, " ")
    .trim();
}

function meaningfulValue(value: string | null | undefined): string {
  const normalized = value?.replace(/\s+/g, " ").trim() ?? "";
  return /^(?:не\s+указан(?:о|а|ы)?|не\s+требуется|не\s+применимо|нет|—|-)$/iu.test(
    normalized,
  )
    ? ""
    : normalized;
}
