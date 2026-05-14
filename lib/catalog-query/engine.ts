import { buildProductCatalogName } from "@/lib/catalog-seo";
import { isFuzzyCatalogMatch } from "@/lib/search/fuzzy";
import type { PublicCatalogProduct } from "@/lib/public-catalog/types";

import {
  buildProductQueryText,
  compactCode,
  normalizeCatalogQuery,
  normalizeConnectionType,
  normalizeMaterial,
  normalizeModelCode,
  normalizeText,
  parseDn,
  parsePn,
  transliterateToLatin,
  type NormalizedCatalogQuery,
} from "./normalize";

export type CatalogQueryFilters = {
  category?: string;
  subcategory?: string;
  dn?: string | number;
  pn?: string | number;
  model?: string;
  thread?: string;
  material?: string;
  connection?: string;
  connectionType?: string;
  controlType?: string;
};

export type CatalogQuerySort = "relevance" | "name" | "price-asc" | "price-desc";

export type CatalogFacetOption = {
  value: string;
  label: string;
  count: number;
  disabled: boolean;
};

export type CatalogQueryFacets = {
  categories: CatalogFacetOption[];
  subcategories: CatalogFacetOption[];
  dn: CatalogFacetOption[];
  pn: CatalogFacetOption[];
  model: CatalogFacetOption[];
  thread: CatalogFacetOption[];
  material: CatalogFacetOption[];
  connectionType: CatalogFacetOption[];
  controlType: CatalogFacetOption[];
};

export type CatalogQueryInput = {
  products: PublicCatalogProduct[];
  q?: string;
  filters?: CatalogQueryFilters;
  sort?: CatalogQuerySort;
  page?: number;
  pageSize?: number;
};

export type CatalogQueryResult = {
  items: PublicCatalogProduct[];
  pageItems: PublicCatalogProduct[];
  total: number;
  page: number;
  totalPages: number;
  facets: CatalogQueryFacets;
  appliedFilters: CatalogQueryFilters;
  normalizedQuery: NormalizedCatalogQuery;
};

type IndexedProduct = {
  product: PublicCatalogProduct;
  title: string;
  titleText: string;
  titleCompact: string;
  model: string;
  text: string;
  compact: string;
  latin: string;
  tokens: string[];
  score: number;
};

const EMPTY_FACETS: CatalogQueryFacets = {
  categories: [],
  subcategories: [],
  dn: [],
  pn: [],
  model: [],
  thread: [],
  material: [],
  connectionType: [],
  controlType: [],
};

export function runCatalogQuery(input: CatalogQueryInput): CatalogQueryResult {
  const pageSize = Math.max(1, input.pageSize ?? 12);
  const requestedPage = Math.max(1, input.page ?? 1);
  const normalizedQuery = normalizeCatalogQuery(input.q);
  const appliedFilters = normalizeFilters(input.filters ?? {});

  const indexed = input.products.map(indexProduct);
  const basePool = indexed.filter((item) => matchesBaseFilters(item.product, appliedFilters));
  const queryMatched = normalizedQuery.text
    ? basePool
        .map((item) => ({ ...item, score: scoreProduct(item, normalizedQuery) }))
        .filter((item) => item.score > 0)
    : basePool.map((item) => ({ ...item, score: 1 }));

  const sorted = sortIndexedProducts(queryMatched, input.sort ?? "relevance");
  const items = sorted.map((item) => item.product);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const start = (page - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize);

  return {
    items,
    pageItems,
    total,
    page,
    totalPages,
    facets: buildFacets(queryMatched.map((item) => item.product), appliedFilters),
    appliedFilters,
    normalizedQuery,
  };
}

export function searchCatalogProducts(
  products: PublicCatalogProduct[],
  q: string,
  limit = 8,
): PublicCatalogProduct[] {
  return runCatalogQuery({
    products,
    q,
    page: 1,
    pageSize: limit,
    sort: "relevance",
  }).pageItems;
}

function indexProduct(product: PublicCatalogProduct): IndexedProduct {
  const title = buildProductCatalogName(product);
  const queryText = `${title} ${buildProductQueryText(product)}`;
  const text = normalizeText(queryText);
  return {
    product,
    title,
    titleText: normalizeText(title),
    titleCompact: compactCode(title),
    model: normalizeModelCode(product.model || product.name || product.slug) ?? "",
    text,
    compact: compactCode(queryText),
    latin: transliterateToLatin(text),
    tokens: text.split(" ").filter(Boolean),
    score: 0,
  };
}

function scoreProduct(item: IndexedProduct, query: NormalizedCatalogQuery): number {
  let score = 0;
  const requestedConnection = getRequestedConnection(query);
  const requestedCategory = getRequestedCategory(query);

  if (query.model && item.model !== query.model && !item.compact.includes(query.model)) return 0;
  if (query.dn != null && item.product.dn !== query.dn) return 0;
  if (query.pn != null && item.product.pn !== query.pn) return 0;
  if (requestedConnection && getEffectiveConnectionType(item.product) !== requestedConnection) return 0;
  if (requestedCategory && item.product.category !== requestedCategory) return 0;

  if (query.model && item.model === query.model) score += 1200;
  if (query.model && item.compact.includes(query.model)) score += 900;
  if (query.model && item.product.dn === query.dn && item.product.pn === query.pn) score += 600;
  if (query.dn != null && item.product.dn === query.dn) score += 220;
  if (query.pn != null && item.product.pn === query.pn) score += 220;

  if (item.product.slug.toLowerCase().includes(query.raw.toLowerCase())) score += 520;
  if (query.compact && item.product.slug.toLowerCase().replace(/[^a-z0-9]+/g, "").includes(query.compact)) {
    score += 420;
  }
  if (query.text && item.titleText.includes(query.text)) score += 500;
  if (query.compact && item.titleCompact.includes(query.compact)) score += 440;

  for (const token of query.tokens) {
    if (token.length <= 1) continue;
    if (item.titleText.includes(token)) score += 90;
    else if (item.text.includes(token)) score += 45;
    else if (item.latin.includes(token)) score += 35;
  }

  for (const token of query.compactTokens) {
    if (token.length < 3) continue;
    if (item.compact.includes(token)) score += 70;
  }

  if (query.tokens.some((token) => normalizeText(item.product.categoryName).includes(token))) {
    score += 70;
  }
  if (query.tokens.some((token) => normalizeText(item.product.subcategoryName).includes(token))) {
    score += 70;
  }
  if (query.text && isFuzzyCatalogMatch(query.text, item.text)) {
    score += 20;
  }

  return score;
}

function getRequestedConnection(query: NormalizedCatalogQuery): string | undefined {
  const connection = normalizeConnectionType(query.text);
  const knownConnections = new Set(["фланцевое", "межфланцевое", "под приварку", "муфтовое"]);
  return knownConnections.has(connection) ? connection : undefined;
}

function getRequestedCategory(query: NormalizedCatalogQuery): string | undefined {
  const text = query.text;
  const tokens = new Set(query.tokens);
  if (text.includes("задвижк")) return "zadvizhki";
  if (text.includes("кран")) return "krany-sharovye";
  if (text.includes("клапан")) return "klapany";
  if (text.includes("затвор")) return "zatvory";
  if (tokens.has("фланец") || tokens.has("фланцы")) return "flansy-i-otvody";
  if (text.includes("компенсатор") || text.includes("фильтр")) return "filtry-i-kompensatory";
  return undefined;
}

function getEffectiveConnectionType(product: PublicCatalogProduct): string {
  const explicit = normalizeConnectionType(product.connectionType);
  if (explicit && explicit !== normalizeText("Не указано")) return explicit;

  const model = normalizeModelCode(product.model) ?? "";
  if (
    product.category === "zadvizhki" &&
    ["30ч6бр", "30с41нж", "30с64нж"].includes(model)
  ) {
    return normalizeConnectionType("Фланцевое");
  }

  return explicit;
}

function matchesBaseFilters(product: PublicCatalogProduct, filters: CatalogQueryFilters): boolean {
  if (filters.category && product.category !== filters.category) return false;
  if (filters.subcategory && product.subcategory !== filters.subcategory) return false;

  const dn = numberFilter(filters.dn);
  if (dn != null && product.dn !== dn) return false;

  const pn = numberFilter(filters.pn);
  if (pn != null && product.pn !== pn) return false;

  if (filters.model) {
    const selected = normalizeModelCode(filters.model) ?? compactCode(filters.model);
    const productModel = normalizeModelCode(product.model) ?? compactCode(product.model);
    if (productModel !== selected) return false;
  }
  if (filters.thread && product.thread !== filters.thread) return false;
  if (filters.material && normalizeMaterial(product.material) !== normalizeMaterial(String(filters.material))) {
    return false;
  }

  const connection = filters.connection ?? filters.connectionType;
  if (
    connection &&
    normalizeConnectionType(product.connectionType) !== normalizeConnectionType(String(connection))
  ) {
    return false;
  }

  if (filters.controlType && normalizeText(product.controlType) !== normalizeText(String(filters.controlType))) {
    return false;
  }

  return true;
}

function buildFacets(
  products: PublicCatalogProduct[],
  filters: CatalogQueryFilters,
): CatalogQueryFacets {
  return {
    ...EMPTY_FACETS,
    categories: facet(products, (p) => p.category, (p) => p.categoryName, filters.category),
    subcategories: facet(products, (p) => p.subcategory, (p) => p.subcategoryName, filters.subcategory),
    dn: numericFacet(products, (p) => p.dn, filters.dn),
    pn: numericFacet(products, (p) => p.pn, filters.pn),
    model: facet(products, (p) => p.model, (p) => p.model, filters.model),
    thread: facet(products, (p) => p.thread ?? "", (p) => p.thread ?? "", filters.thread),
    material: facet(products, (p) => normalizeMaterial(p.material), (p) => p.material, filters.material),
    connectionType: facet(
      products,
      (p) => normalizeConnectionType(p.connectionType),
      (p) => p.connectionType,
      filters.connection ?? filters.connectionType,
    ),
    controlType: facet(products, (p) => normalizeText(p.controlType), (p) => p.controlType, filters.controlType),
  };
}

function facet(
  products: PublicCatalogProduct[],
  getValue: (product: PublicCatalogProduct) => string,
  getLabel: (product: PublicCatalogProduct) => string,
  selected?: string | number,
): CatalogFacetOption[] {
  const map = new Map<string, { label: string; count: number }>();
  for (const product of products) {
    const value = getValue(product).trim();
    if (!value) continue;
    const current = map.get(value);
    if (current) current.count += 1;
    else map.set(value, { label: getLabel(product) || value, count: 1 });
  }

  const selectedValue = selected == null ? "" : String(selected);
  if (selectedValue && !map.has(selectedValue)) {
    map.set(selectedValue, { label: selectedValue, count: 0 });
  }

  return [...map.entries()]
    .map(([value, meta]) => ({
      value,
      label: meta.count > 0 ? `${meta.label} (${meta.count})` : `${meta.label} (0)`,
      count: meta.count,
      disabled: meta.count === 0,
    }))
    .sort((a, b) => a.label.localeCompare(b.label, "ru", { numeric: true }));
}

function numericFacet(
  products: PublicCatalogProduct[],
  getValue: (product: PublicCatalogProduct) => number | undefined,
  selected?: string | number,
): CatalogFacetOption[] {
  const map = new Map<number, number>();
  for (const product of products) {
    const value = getValue(product);
    if (value == null) continue;
    map.set(value, (map.get(value) ?? 0) + 1);
  }
  const selectedNumber = numberFilter(selected);
  if (selectedNumber != null && !map.has(selectedNumber)) map.set(selectedNumber, 0);

  return [...map.entries()]
    .map(([value, count]) => ({
      value: String(value),
      label: `${value} (${count})`,
      count,
      disabled: count === 0,
    }))
    .sort((a, b) => Number(a.value) - Number(b.value));
}

function normalizeFilters(filters: CatalogQueryFilters): CatalogQueryFilters {
  return {
    category: normalizeFilterValue(filters.category),
    subcategory: normalizeFilterValue(filters.subcategory),
    dn: filters.dn ?? parseDn(String(filters.dn ?? "")),
    pn: filters.pn ?? parsePn(String(filters.pn ?? "")),
    model: normalizeFilterValue(filters.model),
    thread: normalizeFilterValue(filters.thread),
    material: normalizeFilterValue(filters.material),
    connection: normalizeFilterValue(filters.connection),
    connectionType: normalizeFilterValue(filters.connectionType),
    controlType: normalizeFilterValue(filters.controlType),
  };
}

function numberFilter(value: string | number | undefined): number | undefined {
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (!value) return undefined;
  if (isEmptyFilterValue(value)) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function normalizeFilterValue(value: string | number | undefined): string | undefined {
  if (value == null) return undefined;
  const stringValue = String(value).trim();
  return isEmptyFilterValue(stringValue) ? undefined : stringValue;
}

function isEmptyFilterValue(value: string): boolean {
  const normalized = normalizeText(value);
  return normalized === "" || normalized === "all" || normalized === "все";
}

function sortIndexedProducts(products: IndexedProduct[], sort: CatalogQuerySort): IndexedProduct[] {
  return [...products].sort((a, b) => {
    if (sort === "price-asc") {
      return (a.product.price ?? Number.MAX_SAFE_INTEGER) - (b.product.price ?? Number.MAX_SAFE_INTEGER);
    }
    if (sort === "price-desc") {
      return (b.product.price ?? -1) - (a.product.price ?? -1);
    }
    if (sort === "name") {
      return a.title.localeCompare(b.title, "ru", { numeric: true });
    }

    return (
      b.score - a.score ||
      Number(Boolean(b.product.primaryImageUrl)) - Number(Boolean(a.product.primaryImageUrl)) ||
      a.title.localeCompare(b.title, "ru", { numeric: true }) ||
      a.product.slug.localeCompare(b.product.slug)
    );
  });
}
