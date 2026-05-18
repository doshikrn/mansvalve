export type ProductDetailBlocks = {
  standards: string[];
  benefits: string[];
  applications: string[];
  qualityDocuments: string[];
  supplyTerms: string[];
};

export type ProductDetailBlockKey = keyof ProductDetailBlocks;

export const PRODUCT_DETAIL_BLOCK_FIELDS: Array<{
  key: ProductDetailBlockKey;
  name: string;
  title: string;
  description: string;
}> = [
  {
    key: "standards",
    name: "detailStandards",
    title: "Стандарты",
    description: "ГОСТ, ТР ТС и другие нормативы. Один пункт на строку.",
  },
  {
    key: "benefits",
    name: "detailBenefits",
    title: "Преимущества",
    description: "Ключевые преимущества товара. Один пункт на строку.",
  },
  {
    key: "applications",
    name: "detailApplications",
    title: "Область применения",
    description: "Где используется товар. Один пункт на строку.",
  },
  {
    key: "qualityDocuments",
    name: "detailQualityDocuments",
    title: "Документация и качество",
    description: "Паспорт, сертификаты, испытания и контроль. Один пункт на строку.",
  },
  {
    key: "supplyTerms",
    name: "detailSupplyTerms",
    title: "Условия поставки",
    description: "НДС, доставка, КП и документы. Один пункт на строку.",
  },
];

export const EMPTY_PRODUCT_DETAIL_BLOCKS: ProductDetailBlocks = {
  standards: [],
  benefits: [],
  applications: [],
  qualityDocuments: [],
  supplyTerms: [],
};

export function normalizeProductDetailBlocks(value: unknown): ProductDetailBlocks {
  if (!value || typeof value !== "object") return EMPTY_PRODUCT_DETAIL_BLOCKS;
  const source = value as Partial<Record<keyof ProductDetailBlocks, unknown>>;
  return {
    standards: normalizeStringArray(source.standards),
    benefits: normalizeStringArray(source.benefits),
    applications: normalizeStringArray(source.applications),
    qualityDocuments: normalizeStringArray(source.qualityDocuments),
    supplyTerms: normalizeStringArray(source.supplyTerms),
  };
}

export function joinProductDetailBlockLines(value: string[] | undefined): string {
  return (value ?? []).join("\n");
}

export function parseProductDetailBlockLines(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function hasProductDetailBlockContent(blocks: ProductDetailBlocks): boolean {
  return PRODUCT_DETAIL_BLOCK_FIELDS.some(({ key }) => blocks[key].length > 0);
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item ?? "").trim())
    .filter(Boolean);
}
