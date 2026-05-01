import type {
  PublicCatalogCategory,
  PublicCatalogProduct,
} from "@/lib/public-catalog/types";

export interface CatalogFilterOption {
  value: string;
  label: string;
}

export interface CatalogLandingPage {
  categorySlug: string;
  slug: string;
  title: string;
  description: string;
  h1: string;
  filters: {
    categoryId: string;
    subcategoryId?: string;
    model?: string;
    pn?: number;
    material?: string;
    connectionType?: string;
    controlType?: string;
    q?: string;
  };
}

export const CATALOG_CATEGORY_LABELS: Record<string, string> = {
  zadvizhki: "Задвижки",
  zatvory: "Затворы дисковые",
  "krany-sharovye": "Краны шаровые",
  klapany: "Клапаны обратные",
  "filtry-i-kompensatory": "Компенсаторы",
  "flansy-i-otvody": "Фланцы",
  elektroprivody: "Электроприводы",
  "krepezh-i-prokladki": "Комплектующие",
};

export const CATALOG_CATEGORY_ORDER = [
  "zadvizhki",
  "zatvory",
  "krany-sharovye",
  "klapany",
  "filtry-i-kompensatory",
  "flansy-i-otvody",
  "elektroprivody",
  "krepezh-i-prokladki",
] as const;

export const MODEL_FILTER_OPTIONS: CatalogFilterOption[] = [
  { value: "30ч6бр", label: "30ч6бр" },
  { value: "30ч39р", label: "30ч39р" },
  { value: "30с41нж", label: "30с41нж" },
  { value: "30с64нж", label: "30с64нж" },
];

export const DN_FILTER_OPTIONS = [
  15, 20, 25, 32, 40, 50, 65, 80, 100, 150, 200, 250, 300, 400, 500, 600, 800,
  1000,
] as const;

export const PN_FILTER_OPTIONS = [10, 16, 25, 40, 64] as const;

export const MATERIAL_FILTER_OPTIONS: CatalogFilterOption[] = [
  { value: "Чугун", label: "Чугун" },
  { value: "Сталь", label: "Сталь" },
  { value: "Нержавеющая сталь", label: "Нержавеющая сталь" },
  { value: "WCB", label: "WCB" },
];

export const CONNECTION_FILTER_OPTIONS: CatalogFilterOption[] = [
  { value: "Фланцевое", label: "Фланцевое" },
  { value: "Межфланцевое", label: "Межфланцевое" },
  { value: "Под приварку", label: "Под приварку" },
  { value: "Муфтовое", label: "Муфтовое" },
];

export const CONTROL_FILTER_OPTIONS: CatalogFilterOption[] = [
  { value: "Ручное", label: "Ручное" },
  { value: "Редуктор", label: "Редуктор" },
  { value: "Электропривод", label: "Электропривод" },
];

export const CATEGORY_SEO: Record<
  string,
  { title: string; description: string; h1: string }
> = {
  zadvizhki: {
    title: "Задвижки купить в Казахстане — чугунные и стальные | MANSVALVE GROUP",
    description:
      "Промышленные задвижки DN50-DN1000, PN16-PN64 с поставкой по Казахстану. Чугунные, стальные, с обрезиненным клином, с электроприводом.",
    h1: "Задвижки промышленные в Казахстане",
  },
};

export const ZADVIZHKI_SUBCATEGORY_LINKS: CatalogFilterOption[] = [
  { value: "", label: "Все задвижки" },
  { value: "zadvizhki-chugunnye", label: "Чугунные задвижки" },
  { value: "zadvizhki-stalnyye", label: "Стальные задвижки" },
  { value: "zadvizhki-s-obrezinennym-klinom", label: "Задвижки с обрезиненным клином" },
  { value: "zadvizhki-s-elektroprivodom", label: "Задвижки с электроприводом" },
  { value: "pn16", label: "Задвижки PN16" },
  { value: "pn25", label: "Задвижки PN25" },
  { value: "pn40", label: "Задвижки PN40" },
  { value: "pn64", label: "Задвижки PN64" },
];

export interface CategoryQuickLink {
  label: string;
  href: string;
}

export const CATEGORY_QUICK_LINKS: Record<string, CategoryQuickLink[]> = {
  zadvizhki: [
    { label: "Все задвижки", href: "/catalog/category/zadvizhki" },
    { label: "Чугунные задвижки", href: "/catalog/category/zadvizhki?material=Чугун" },
    { label: "Стальные задвижки", href: "/catalog/category/zadvizhki?material=Сталь" },
    { label: "Задвижки с обрезиненным клином", href: "/catalog/category/zadvizhki?q=обрезиненным" },
    { label: "Задвижки с электроприводом", href: "/zadvizhki/s-elektroprivodom" },
    { label: "Задвижки PN16", href: "/catalog/category/zadvizhki?pn=16" },
    { label: "Задвижки PN25", href: "/catalog/category/zadvizhki?pn=25" },
    { label: "Задвижки PN40", href: "/catalog/category/zadvizhki?pn=40" },
    { label: "Задвижки PN64", href: "/catalog/category/zadvizhki?pn=64" },
  ],
};

export function getCategoryQuickLinks(categoryId: string): CategoryQuickLink[] {
  return CATEGORY_QUICK_LINKS[categoryId] ?? [];
}

export const CATALOG_LANDING_PAGES: CatalogLandingPage[] = [
  {
    categorySlug: "zadvizhki",
    slug: "30ch6br",
    title: "Задвижка чугунная фланцевая 30ч6бр купить в Казахстане",
    description:
      "Задвижки чугунные фланцевые 30ч6бр DN50-DN1000 с поставкой по Казахстану. КП за 15 минут, НДС, сертификаты и паспорт изделия.",
    h1: "Задвижки чугунные фланцевые 30ч6бр",
    filters: {
      categoryId: "zadvizhki",
      model: "30ч6бр",
      material: "Чугун",
      connectionType: "Фланцевое",
    },
  },
  {
    categorySlug: "zadvizhki",
    slug: "30s41nzh",
    title: "Задвижка стальная фланцевая 30с41нж цена Алматы",
    description:
      "Задвижки стальные фланцевые 30с41нж DN50-DN1000 для промышленных объектов. Поставка по Казахстану, КП, сертификаты, гарантия.",
    h1: "Задвижки стальные фланцевые 30с41нж",
    filters: {
      categoryId: "zadvizhki",
      model: "30с41нж",
      material: "Сталь",
      connectionType: "Фланцевое",
    },
  },
  {
    categorySlug: "zadvizhki",
    slug: "s-elektroprivodom",
    title: "Задвижки с электроприводом купить в Казахстане | MANSVALVE GROUP",
    description:
      "Задвижки с электроприводом для трубопроводов DN50-DN1000, PN16-PN64. Подбор по параметрам, КП за 15 минут, доставка по РК.",
    h1: "Задвижки с электроприводом",
    filters: {
      categoryId: "zadvizhki",
      controlType: "Электропривод",
    },
  },
  {
    categorySlug: "zatvory",
    slug: "mezhflantsevye",
    title: "Затворы дисковые межфланцевые купить в Казахстане | MANSVALVE GROUP",
    description:
      "Затворы дисковые межфланцевые DN50-DN1200 с ручным управлением, редуктором или электроприводом. Поставка по Казахстану.",
    h1: "Затворы дисковые межфланцевые",
    filters: {
      categoryId: "zatvory",
      connectionType: "Межфланцевое",
    },
  },
  {
    categorySlug: "flancy",
    slug: "ru16",
    title: "Фланцы Ру16 купить в Казахстане | MANSVALVE GROUP",
    description:
      "Фланцы Ру16 DN15-DN1000 для промышленных трубопроводов. Работаем с НДС, предоставляем документы и доставку по Казахстану.",
    h1: "Фланцы Ру16",
    filters: {
      categoryId: "flansy-i-otvody",
      pn: 16,
    },
  },
];

export function getOrderedCatalogCategories(
  categories: PublicCatalogCategory[],
): PublicCatalogCategory[] {
  const order = new Map<string, number>(
    CATALOG_CATEGORY_ORDER.map((id, index) => [id, index]),
  );
  return [...categories]
    .map((category) => ({
      ...category,
      name: CATALOG_CATEGORY_LABELS[category.id] ?? category.name,
    }))
    .sort((a, b) => (order.get(a.id) ?? 99) - (order.get(b.id) ?? 99));
}

export function getCatalogCategoryLabel(categoryId: string, fallback: string): string {
  return CATALOG_CATEGORY_LABELS[categoryId] ?? fallback;
}

export function getCategorySeo(category: PublicCatalogCategory) {
  return CATEGORY_SEO[category.id];
}

export function getLandingPage(
  categorySlug: string,
  slug: string,
): CatalogLandingPage | undefined {
  return CATALOG_LANDING_PAGES.find(
    (page) => page.categorySlug === categorySlug && page.slug === slug,
  );
}

export function buildProductCatalogName(product: PublicCatalogProduct): string {
  const baseName = getProductTypeLabel(product);
  const material = getDisplayMaterial(product, baseName);
  const model = product.model?.trim();
  const dn = product.dn != null ? `DN${product.dn}` : "";
  const pn = product.pn != null ? `PN${product.pn}` : "";
  const connection = getDisplayConnection(product, baseName);
  const parts = [baseName, material, model, dn, pn, connection].filter(Boolean);
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

export function buildProductMetaDescription(productName: string): string {
  return `${productName} с поставкой по Казахстану. Работаем с НДС, предоставляем сертификаты, паспорт изделия и гарантию. КП за 15 минут.`;
}

function getProductTypeLabel(product: PublicCatalogProduct): string {
  const name = product.name.toLowerCase();
  if (product.category === "zadvizhki") return "Задвижка";
  if (product.category === "zatvory") return "Затвор дисковый";
  if (product.category === "krany-sharovye") return "Кран шаровой";
  if (product.category === "klapany") return "Клапан обратный";
  if (name.includes("фланец")) return "Фланец";
  if (name.includes("компенсатор")) return "Компенсатор";
  if (product.category === "elektroprivody") return "Электропривод";
  return product.categoryName.replace(/ы$/u, "а");
}

function getDisplayMaterial(product: PublicCatalogProduct, productType: string): string {
  if (!product.material || product.material === "Не указан") return "";
  const feminine = productType === "Задвижка";
  if (product.material === "Сталь") return feminine ? "стальная" : "стальной";
  if (product.material === "Чугун") return feminine ? "чугунная" : "чугунный";
  if (product.material === "Нержавеющая сталь") {
    return feminine ? "нержавеющая" : "нержавеющий";
  }
  return product.material;
}

function getDisplayConnection(product: PublicCatalogProduct, productType: string): string {
  if (!product.connectionType || product.connectionType === "Не указано") {
    if (product.name.toLowerCase().includes("обрезин")) {
      return "с обрезиненным клином";
    }
    return "";
  }
  const feminine = productType === "Задвижка";
  if (product.connectionType === "Фланцевое") return feminine ? "фланцевая" : "фланцевый";
  if (product.connectionType === "Межфланцевое") {
    return feminine ? "межфланцевая" : "межфланцевый";
  }
  if (product.connectionType === "Под приварку") return "под приварку";
  if (product.connectionType === "Муфтовое" || product.connectionType === "Резьбовое") {
    return feminine ? "муфтовая" : "муфтовый";
  }
  return product.connectionType.toLowerCase();
}
