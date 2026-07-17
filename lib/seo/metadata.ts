import { COMPANY_BRAND_SEO } from "@/lib/company";

/** Recommended max length of the full `<title>` in the browser (incl. brand template). */
export const BROWSER_TITLE_MAX_LENGTH = 60;

/** Root layout template: `%s | MANSVALVE GROUP`. */
export const TITLE_TEMPLATE_BRAND_SUFFIX = ` | ${COMPANY_BRAND_SEO}`;

/** Max length of the `%s` part before the brand suffix is appended. */
export const TITLE_PART_MAX_LENGTH = Math.max(
  24,
  BROWSER_TITLE_MAX_LENGTH - TITLE_TEMPLATE_BRAND_SUFFIX.length,
);

const DESCRIPTION_MAX_LENGTH = 160;

type SearchParamValue = string | string[] | undefined;
type SearchParamsWithPage = { page?: SearchParamValue };

export function stripBrandFromTitle(value: string): string {
  return value
    .replace(/\s*[|—-]\s*MANSVALVE\s+GROUP\s*$/i, "")
    .replace(/\s*[|—-]\s*Mansvalve\s+Group\s*$/i, "")
    .trim();
}

/** Title part for Next.js `title` metadata (brand comes from root template). */
export function normalizeMetaTitle(value: string): string {
  return clampMetaTextAtWord(stripBrandFromTitle(value), TITLE_PART_MAX_LENGTH);
}

/** Full browser title as rendered via root `title.template`. */
export function buildBrowserTitleFromPart(titlePart: string): string {
  const part = normalizeMetaTitle(titlePart);
  if (!part) return COMPANY_BRAND_SEO;
  if (stripBrandFromTitle(part).length !== part.length) return part;
  const full = `${part}${TITLE_TEMPLATE_BRAND_SUFFIX}`;
  if (full.length <= BROWSER_TITLE_MAX_LENGTH) return full;
  const tighter = clampMetaTextAtWord(part, TITLE_PART_MAX_LENGTH - 1);
  return `${tighter}${TITLE_TEMPLATE_BRAND_SUFFIX}`;
}

export function normalizeMetaDescription(value: string): string {
  return clampMetaText(value, DESCRIPTION_MAX_LENGTH);
}

export function getMetaPageNumber(searchParams?: SearchParamsWithPage): number | undefined {
  const raw = Array.isArray(searchParams?.page) ? searchParams?.page[0] : searchParams?.page;
  const normalized = raw?.trim() ?? "";
  if (!/^\d+$/.test(normalized)) return undefined;

  const page = Number(normalized);
  return Number.isSafeInteger(page) && page > 1 ? page : undefined;
}

export function hasNonPaginationSearchParams(searchParams?: object): boolean {
  if (!searchParams) return false;

  return Object.entries(searchParams as Record<string, unknown>).some(([key, value]) => {
    if (key === "page") return false;
    if (Array.isArray(value)) {
      return value.some((item) => typeof item === "string" && item.trim().length > 0);
    }
    return typeof value === "string" && value.trim().length > 0;
  });
}

export function buildPagedCanonical(path: string, pageNumber?: number): string {
  return pageNumber ? `${path}?page=${pageNumber}` : path;
}

export function appendPageNumberSuffix(value: string, pageNumber?: number): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  return pageNumber ? `${normalized} - Страница ${pageNumber}` : normalized;
}

export function buildPagedMeta(input: {
  title: string;
  description: string;
  canonicalPath: string;
  searchParams?: SearchParamsWithPage & object;
}) {
  const pageNumber = getMetaPageNumber(input.searchParams);
  const hasNonPageParams = hasNonPaginationSearchParams(input.searchParams);
  const suffix = pageNumber ? ` - Страница ${pageNumber}` : "";
  const titleBase = pageNumber
    ? clampMetaTextAtWord(
        stripBrandFromTitle(input.title),
        Math.max(
          1,
          BROWSER_TITLE_MAX_LENGTH - TITLE_TEMPLATE_BRAND_SUFFIX.length - suffix.length,
        ),
      )
    : normalizeMetaTitle(input.title);
  const title = pageNumber ? `${titleBase}${suffix}` : titleBase;
  const fullTitle = pageNumber
    ? `${titleBase}${TITLE_TEMPLATE_BRAND_SUFFIX}${suffix}`
    : buildBrowserTitleFromPart(titleBase);
  const description = pageNumber
    ? `${clampMetaTextAtWord(
        input.description,
        Math.max(1, DESCRIPTION_MAX_LENGTH - suffix.length),
      )}${suffix}`
    : normalizeMetaDescription(input.description);

  return {
    title,
    metadataTitle: pageNumber ? { absolute: fullTitle } : title,
    socialTitle: pageNumber ? fullTitle : title,
    fullTitle,
    description,
    canonicalPath: buildPagedCanonical(input.canonicalPath, pageNumber),
    pageNumber,
    robots: hasNonPageParams ? { index: false, follow: true } : undefined,
  };
}

export function clampMetaTextAtWord(value: string, maxLength: number): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  if (maxLength <= 1) return "…";

  const slice = normalized.slice(0, maxLength - 1);
  const lastSpace = slice.lastIndexOf(" ");
  const cut = (lastSpace > maxLength * 0.55 ? slice.slice(0, lastSpace) : slice).trimEnd();
  return `${cut.replace(/[,\s.;:—-]+$/, "")}…`;
}

function clampMetaText(value: string, maxLength: number): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;

  const cut = normalized.slice(0, maxLength - 1).trimEnd();
  return `${cut.replace(/[,\s.;:—-]+$/, "")}…`;
}
