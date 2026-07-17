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

const PRODUCT_BROWSER_TITLE_MAX_LENGTH = 90;
const PRODUCT_TITLE_PART_MAX_LENGTH =
  PRODUCT_BROWSER_TITLE_MAX_LENGTH - TITLE_TEMPLATE_BRAND_SUFFIX.length;
const PRODUCT_DESCRIPTION_MAX_LENGTH = 160;

export type ProductSeoIdentityPart = {
  field:
    | "model"
    | "externalId"
    | "dn"
    | "pn"
    | "material"
    | "connectionType"
    | "controlType"
    | "thread"
    | "variant";
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
    return "Промышленная арматура";
  }

  const identityParts = identity ? getProductSeoIdentityParts(identity) : [];
  const augmented = appendMissingIdentityParts(trimmed, identityParts);
  return trimProductNameForTitle(augmented, PRODUCT_TITLE_PART_MAX_LENGTH, identityParts);
}

/** Полный title страницы товара, как в браузере (с брендом из root template). */
export function formatProductPageTitle(titlePart: string): string {
  const part = stripProductTitleEllipsis(stripBrandFromTitle(titlePart));
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
    // Root metadata appends the brand. Preserve manager/template wording otherwise.
    return stripProductTitleEllipsis(stripBrandFromTitle(manual));
  }
  return buildProductAutoMetaTitlePart(sourceTitle, identity);
}

/** Neutral B2B product description. Preferred/manual copy is never marketing-cleaned. */
export function buildProductSeoDescription(
  input: ProductSeoNamingInput,
  sourceTitle: string,
  preferredDescription?: string | null,
): string {
  const preferred = preferredDescription?.replace(/\s+/g, " ").trim();
  if (preferred) return normalizeProductSeoDescription(preferred);

  const compactTitle = buildProductAutoMetaTitlePart(sourceTitle, input);
  const region = input.category === "flansy-i-otvody" ? "по Казахстану" : "по РК";
  const taxonomy = (input.subcategoryName || input.categoryName || "").replace(/\s+/g, " ").trim();
  const fixedParts = [
    `${compactTitle}.`,
    "Характеристики, материалы и данные для подбора.",
    `Поставка ${region}.`,
    `${COMPANY_BRAND_SEO}.`,
  ];
  const withTaxonomy = taxonomy
    ? [fixedParts[0], `${taxonomy}.`, ...fixedParts.slice(1)].join(" ")
    : fixedParts.join(" ");
  const fallback = fixedParts.join(" ");
  const description = withTaxonomy.length <= PRODUCT_DESCRIPTION_MAX_LENGTH
    ? withTaxonomy
    : fallback;

  return clampProductMetaText(description, PRODUCT_DESCRIPTION_MAX_LENGTH);
}

/** Product-only metadata clamp: keeps the shared pagination behavior unchanged. */
export function normalizeProductSeoDescription(value: string): string {
  return clampProductMetaText(value, PRODUCT_DESCRIPTION_MAX_LENGTH);
}

export function getProductSeoIdentityParts(
  input: ProductSeoNamingInput,
): ProductSeoIdentityPart[] {
  const specs = Array.isArray(input.specs)
    ? Object.fromEntries(input.specs.map((item) => [item.key, item.value]))
    : input.specs ?? {};
  const specModel = Object.entries(specs).find(([key]) => /модел|маркир/i.test(key))?.[1];
  const publicArticle = getPublicProductArticle(input);
  const values: ProductSeoIdentityPart[] = [
    { field: "model", value: meaningfulValue(input.model) || meaningfulValue(specModel) },
    {
      field: "externalId",
      value: publicArticle ? `арт. ${publicArticle}` : "",
    },
    { field: "dn", value: input.dn != null ? `DN${input.dn}` : "" },
    { field: "pn", value: input.pn != null ? `PN${input.pn}` : "" },
    { field: "material", value: meaningfulValue(input.material) },
    { field: "connectionType", value: meaningfulValue(input.connectionType) },
    { field: "controlType", value: meaningfulValue(input.controlType) },
    { field: "thread", value: meaningfulValue(input.thread) },
    { field: "variant", value: getHumanReadableVariant(input) },
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
    const head = clampProductMetaText(name, headMax);
    return `${head} ${tail}`.trim();
  }

  return clampProductMetaText(name, maxLen);
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
  return stripProductTitleEllipsis(
    stripBrandFromTitle(value)
    .replace(/^купить\s+/iu, "")
    .replace(/\s+[—-]\s*купить\s+в\s+Казахстане\s*$/iu, "")
    .replace(/\s+купить\s+в\s+Казахстане\s*$/iu, ""),
  );
}

function stripProductTitleEllipsis(value: string): string {
  return value.replace(/(?:\.{3,}|…)/gu, " ").replace(/\s+/g, " ").trim();
}

/** `externalId` is an import key unless it looks like a real public article. */
function getPublicProductArticle(input: ProductSeoNamingInput): string {
  const value = meaningfulValue(input.externalId);
  if (!value) return "";

  const normalized = value.trim();
  const comparable = normalizeComparableTitle(normalized);
  const slug = normalizeComparableTitle(input.slug);
  const model = normalizeComparableTitle(input.model);

  if (/^\d+$/u.test(normalized)) return "";
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu.test(normalized)) {
    return "";
  }
  if (/^(?:series|internal|import|product|db|welding)[_:-]/iu.test(normalized)) return "";
  if (normalized.includes(":")) return "";
  if (slug && comparable === slug) return "";
  if (model && comparable === model) return "";

  return normalized;
}

/** Makes legacy slug collision suffixes readable without exposing the slug or DB id. */
function getHumanReadableVariant(input: ProductSeoNamingInput): string {
  const suffix = input.slug?.match(/-(\d+)$/u)?.[1];
  if (!suffix || Number(suffix) < 2) return "";
  const slugBase = input.slug!.slice(0, -(suffix.length + 1));
  const repeatsNamedSlugValue = new RegExp(`(?:dn|pn)${suffix}$`, "iu").test(slugBase);

  const semanticText = [
    input.name,
    input.model,
    input.dn != null ? `DN${input.dn}` : "",
    input.pn != null ? `PN${input.pn}` : "",
  ].join(" ");
  if (
    !repeatsNamedSlugValue &&
    new RegExp(`(^|\\D)${suffix}(\\D|$)`, "u").test(semanticText)
  ) {
    return "";
  }

  return `исполнение ${suffix}`;
}

function clampProductMetaText(value: string, maxLength: number): string {
  return clampMetaTextAtWord(value, maxLength, { appendEllipsis: false });
}

function meaningfulValue(value: string | null | undefined): string {
  const normalized = value?.replace(/\s+/g, " ").trim() ?? "";
  return /^(?:не\s+указан(?:о|а|ы)?|не\s+требуется|не\s+применимо|нет|—|-)$/iu.test(
    normalized,
  )
    ? ""
    : normalized;
}
