const TITLE_MAX_LENGTH = 60;
const DESCRIPTION_MAX_LENGTH = 160;

type SearchParamValue = string | string[] | undefined;
type SearchParamsWithPage = { page?: SearchParamValue };

export function stripBrandFromTitle(value: string): string {
  return value
    .replace(/\s*[|—-]\s*MANSVALVE\s+GROUP\s*$/i, "")
    .replace(/\s*[|—-]\s*Mansvalve\s+Group\s*$/i, "")
    .trim();
}

export function normalizeMetaTitle(value: string): string {
  return clampMetaText(stripBrandFromTitle(value), TITLE_MAX_LENGTH);
}

export function normalizeMetaDescription(value: string): string {
  return clampMetaText(value, DESCRIPTION_MAX_LENGTH);
}

export function getMetaPageNumber(searchParams?: SearchParamsWithPage): number | undefined {
  const raw = Array.isArray(searchParams?.page) ? searchParams?.page[0] : searchParams?.page;
  const page = Number.parseInt(raw ?? "", 10);
  return Number.isFinite(page) && page > 1 ? page : undefined;
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

export function buildPagedMeta(input: {
  title: string;
  description: string;
  canonicalPath: string;
  searchParams?: SearchParamsWithPage & object;
}) {
  const pageNumber = getMetaPageNumber(input.searchParams);
  const hasNonPageParams = hasNonPaginationSearchParams(input.searchParams);
  const title = pageNumber
    ? `${input.title}, страница ${pageNumber}`
    : input.title;
  const description = pageNumber
    ? `${input.description} Страница ${pageNumber}.`
    : input.description;

  return {
    title: normalizeMetaTitle(title),
    description: normalizeMetaDescription(description),
    canonicalPath: buildPagedCanonical(input.canonicalPath, pageNumber),
    robots: hasNonPageParams ? { index: false, follow: true } : undefined,
  };
}

function clampMetaText(value: string, maxLength: number): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;

  const cut = normalized.slice(0, maxLength - 1).trimEnd();
  return `${cut.replace(/[,\s.;:—-]+$/, "")}…`;
}
