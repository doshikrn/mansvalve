import { buildProductAutoMetaTitlePart } from "@/lib/catalog/product-seo-naming";
import type { PublicCatalogProduct } from "@/lib/public-catalog";
import type { ProductDetailBlocks } from "@/lib/product-detail-blocks";
import { normalizeMetaDescription } from "@/lib/seo/metadata";

export type IndustrialSeriesKind = "compensator-kso-k" | "check-valve-19s38nzh";

export interface IndustrialSeriesSeoPage {
  kind: IndustrialSeriesKind;
  categorySlug: string;
  groupSlug?: string;
  slug: string;
  path: string;
  catalogCategoryId: string;
  catalogSubcategoryId: string;
  catalogCategoryName: string;
  catalogSubcategoryName: string;
  series: string;
  model: string;
  dn: number;
  pn: number;
  title: string;
  h1: string;
  seoTitle: string;
  seoDescription: string;
  imageAlt: string;
  imageFileName: string;
  introParagraphs: string[];
  characteristics: Array<{ label: string; value: string }>;
  standards: string[];
  benefits: string[];
  applications: string[];
  qualityDocuments: string[];
  supplyTerms: string[];
}

type KsoKSpec = {
  dn: number;
  movement: string;
  length: string;
};

type CheckValveSpec = {
  dn: number;
  length: string;
};

const KSO_K_SPECS: KsoKSpec[] = [
  { dn: 50, movement: "±25 (50)", length: "260 / 300" },
  { dn: 65, movement: "±25 (50)", length: "260 / 300" },
  { dn: 80, movement: "±25 (50)", length: "270 / 310" },
  { dn: 100, movement: "±25 (50)", length: "290 / 340" },
  { dn: 125, movement: "±25 (50)", length: "310 / 360" },
  { dn: 150, movement: "±50 (100)", length: "420 / 480" },
  { dn: 200, movement: "±50 (100)", length: "440 / 500" },
  { dn: 250, movement: "±50 (100)", length: "450 / 520" },
  { dn: 300, movement: "±50 (100)", length: "480 / 550" },
  { dn: 350, movement: "±50 (100)", length: "500 / 580" },
  { dn: 400, movement: "±50 (100)", length: "520 / 600" },
  { dn: 500, movement: "±50 (100)", length: "550 / 650" },
  { dn: 600, movement: "±60 (120)", length: "620 / 720" },
  { dn: 700, movement: "±60 (120)", length: "650 / 760" },
  { dn: 800, movement: "±60 (120)", length: "700 / 820" },
  { dn: 1000, movement: "±60 (120)", length: "750 / 900" },
];

const CHECK_VALVE_SPECS: CheckValveSpec[] = [
  { dn: 50, length: "230" },
  { dn: 65, length: "290" },
  { dn: 80, length: "310" },
  { dn: 100, length: "350" },
  { dn: 150, length: "480" },
  { dn: 200, length: "550" },
  { dn: 250, length: "650" },
  { dn: 300, length: "750" },
  { dn: 400, length: "950" },
  { dn: 500, length: "1150" },
  { dn: 600, length: "1350" },
];

const COMMON_SUPPLY_TERMS = [
  "Работаем с НДС 16%",
  "Безналичный расчет для B2B, тендеров и государственных закупок",
  "Поставка со склада и под заказ",
  "Доставка по Казахстану транспортными компаниями",
  "Подготовка коммерческого предложения за 15 минут",
  "Полный пакет закрывающих документов",
];

const KSO_K_BLOCKS: ProductDetailBlocks = {
  standards: [
    "ГОСТ 32935-2014 — Компенсаторы сильфонные. Общие технические условия",
    "ГОСТ 15150-69 — Климатическое исполнение УХЛ",
    "ТР ТС 032/2013 — О безопасности оборудования, работающего под избыточным давлением",
  ],
  benefits: [
    "Компенсация температурных расширений трубопровода",
    "Многослойный сильфон с повышенным рабочим ресурсом",
    "Наружный защитный кожух от механических повреждений",
    "Исполнение под приварку для тепловых сетей и промышленных линий",
    "Поставка с паспортом изделия и сертификатами",
  ],
  applications: [
    "Тепловые сети и отопительные магистрали",
    "Промышленные трубопроводы",
    "Котельные и тепловые пункты",
    "Системы горячего водоснабжения",
    "Коммунальная инфраструктура и объекты ЖКХ",
  ],
  qualityDocuments: [
    "Паспорт изделия",
    "Сертификат соответствия ТР ТС",
    "Документы по материалам сильфона и патрубков",
    "Контроль герметичности и качества сварных соединений",
  ],
  supplyTerms: COMMON_SUPPLY_TERMS,
};

const CHECK_VALVE_BLOCKS: ProductDetailBlocks = {
  standards: [
    "ГОСТ 33423-2015 — Арматура трубопроводная. Клапаны обратные. Общие технические условия",
    "ГОСТ 9544-2015 — Нормы герметичности затворов",
    "ГОСТ 33259-2015 — Фланцы арматуры и трубопроводов",
  ],
  benefits: [
    "Защита трубопровода от обратного потока рабочей среды",
    "Поворотная конструкция с дисковым затвором",
    "Корпус из литой углеродистой стали 25Л",
    "Фланцевое присоединение по ГОСТ 33259-2015",
    "Подходит для насосных станций, теплоснабжения и промышленных объектов",
  ],
  applications: [
    "Насосные станции",
    "Системы теплоснабжения",
    "Промышленные трубопроводы",
    "Нефтегазовая инфраструктура",
    "Трубопроводы воды, пара, газа и нефтепродуктов",
  ],
  qualityDocuments: [
    "Паспорт изделия",
    "Сертификаты соответствия",
    "Декларации соответствия",
    "Контроль качества корпуса, затвора и уплотнений",
  ],
  supplyTerms: COMMON_SUPPLY_TERMS,
};

function buildKsoKPage(spec: KsoKSpec): IndustrialSeriesSeoPage {
  const marking = `КСО.К-${spec.dn}-16`;
  const slug = `kso-k-${spec.dn}-16`;
  return {
    kind: "compensator-kso-k",
    categorySlug: "compensatory",
    slug,
    path: `/compensatory/${slug}`,
    catalogCategoryId: "filtry-i-kompensatory",
    catalogSubcategoryId: "kompensatory",
    catalogCategoryName: "Фильтры и компенсаторы",
    catalogSubcategoryName: "Компенсаторы",
    series: "kso-k",
    model: marking,
    dn: spec.dn,
    pn: 16,
    title: `Компенсатор сильфонный ${marking} под приварку`,
    h1: `Компенсатор сильфонный осевой ${marking} Ду ${spec.dn} Ру16 под приварку`,
    seoTitle: buildProductAutoMetaTitlePart(`Компенсатор ${marking} DN${spec.dn} PN16`),
    seoDescription: normalizeMetaDescription(
      `Компенсатор сильфонный осевой ${marking} (Ду ${spec.dn} Ру16) под приварку с защитным кожухом для тепловых сетей и промышленных трубопроводов. Доставка по РК. Паспорт и сертификат ТР ТС.`,
    ),
    imageAlt: `Компенсатор сильфонный осевой ${marking} под приварку с кожухом`,
    imageFileName: `${slug}-bw.jpg`,
    introParagraphs: [
      `Компенсатор сильфонный осевой ${marking} Ду ${spec.dn} Ру16 под приварку предназначен для компенсации температурных расширений в тепловых сетях и промышленных трубопроводах.`,
      "Многослойный сильфон из нержавеющей стали работает в комплекте с наружным защитным кожухом, который снижает риск механических повреждений при эксплуатации и монтаже.",
      `Для данного типоразмера осевой ход составляет ${spec.movement} мм, строительная длина L — ${spec.length} мм.`,
    ],
    characteristics: [
      { label: "Тип изделия", value: "компенсатор сильфонный осевой" },
      { label: "Маркировка", value: marking },
      { label: "Условный проход", value: `DN${spec.dn}` },
      { label: "Номинальное давление", value: "PN16 (1,6 МПа / 16 кгс/см²)" },
      { label: "Осевой ход", value: `${spec.movement} мм` },
      { label: "Строительная длина L", value: `${spec.length} мм` },
      { label: "Тип присоединения", value: "под приварку" },
      { label: "Конструкция сильфона", value: "многослойная" },
      { label: "Наличие кожуха", value: "да, наружный защитный металлический кожух" },
      { label: "Материал сильфона", value: "нержавеющая сталь AISI 321 / AISI 304 (или 12Х18Н10Т)" },
      { label: "Материал кожуха и патрубков", value: "углеродистая конструкционная сталь (Сталь 20 / Ст3сп)" },
      { label: "Температура рабочей среды", value: "от –40 °C до +300 °C (опционально до +400 °C)" },
      { label: "Климатическое исполнение", value: "УХЛ по ГОСТ 15150-69" },
      { label: "Норматив изготовления", value: "ГОСТ 32935-2014" },
      { label: "Класс герметичности", value: "класс «А» по ГОСТ 9544" },
    ],
    ...KSO_K_BLOCKS,
  };
}

function buildCheckValvePage(spec: CheckValveSpec): IndustrialSeriesSeoPage {
  const marking = `19с38нж-${spec.dn}`;
  const slug = `19s38nzh-dn${spec.dn}-pn16`;
  const diameter = `DN${spec.dn}`;
  return {
    kind: "check-valve-19s38nzh",
    categorySlug: "klapany",
    groupSlug: "obratnye",
    slug,
    path: `/catalog/klapany/povorotnye-flancevye/${slug}`,
    catalogCategoryId: "klapany",
    catalogSubcategoryId: "povorotnye-flancevye",
    catalogCategoryName: "Клапаны обратные",
    catalogSubcategoryName: "Поворотные фланцевые клапаны",
    series: "19s38nzh",
    model: marking,
    dn: spec.dn,
    pn: 16,
    title: `Клапан обратный поворотный стальной фланцевый 19с38нж ${diameter} PN16`,
    h1: `Клапан обратный поворотный стальной фланцевый 19с38нж ${diameter} PN16`,
    seoTitle: buildProductAutoMetaTitlePart(`Клапан 19с38нж ${diameter} PN16`),
    seoDescription: normalizeMetaDescription(
      `Поворотный обратный клапан стальной фланцевый 19с38нж ${diameter} PN16 (Ру16) для защиты трубопроводов, насосных станций и систем теплоснабжения от обратного потока. Доставка по РК.`,
    ),
    imageAlt: `Клапан обратный поворотный стальной фланцевый 19с38нж ${diameter} PN16`,
    imageFileName: `19s38nzh-dn${spec.dn}-pn16.jpg`,
    introParagraphs: [
      `Поворотный обратный клапан стальной фланцевый 19с38нж ${diameter} PN16 предназначен для автоматической защиты трубопровода от обратного потока рабочей среды.`,
      "Конструкция с поворотным дисковым затвором применяется на насосных станциях, тепловых сетях, промышленных трубопроводах и объектах нефтегазовой инфраструктуры.",
      `Для данного типоразмера строительная длина L составляет ${spec.length} мм согласно справочным данным ГОСТ.`,
    ],
    characteristics: [
      { label: "Тип изделия", value: "клапан обратный поворотный" },
      { label: "Маркировка", value: marking },
      { label: "Условный проход", value: diameter },
      { label: "Номинальное давление", value: "PN16 (1,6 МПа / 16 кгс/см²)" },
      { label: "Строительная длина L", value: `${spec.length} мм` },
      { label: "Тип затвора / конструкции", value: "поворотный (дисковый затвор / захлопка)" },
      { label: "Тип присоединения", value: "фланцевое по ГОСТ 33259-2015" },
      { label: "Материал корпуса", value: "высокопрочная литая углеродистая сталь 25Л" },
      { label: "Материал уплотнения", value: "коррозионностойкая нержавеющая наплавка на кольцах затвора" },
      { label: "Рабочая среда", value: "вода, пар, теплоносители, жидкие и газообразные нефтепродукты, газ, неагрессивные среды" },
      { label: "Температура рабочей среды", value: "от –40 °C до +425 °C" },
      { label: "Нормативы проектирования", value: "ГОСТ 33423-2015, ГОСТ 9544-2015" },
    ],
    ...CHECK_VALVE_BLOCKS,
  };
}

export const INDUSTRIAL_SERIES_SEO_PAGES: IndustrialSeriesSeoPage[] = [
  ...KSO_K_SPECS.map(buildKsoKPage),
  ...CHECK_VALVE_SPECS.map(buildCheckValvePage),
];

const pagesByPath = new Map(
  INDUSTRIAL_SERIES_SEO_PAGES.map((page) => [page.path, page]),
);

/** Старые SEO-URL серии 19с38нж до переноса в `/catalog/klapany/...`. */
const LEGACY_CHECK_VALVE_PATH_BY_SLUG = new Map<string, IndustrialSeriesSeoPage>(
  INDUSTRIAL_SERIES_SEO_PAGES.filter((page) => page.kind === "check-valve-19s38nzh").map(
    (page) => [`/klapany/obratnye/${page.slug}`, page] as [string, IndustrialSeriesSeoPage],
  ),
);

export function getIndustrialSeriesSeoPageByPath(
  path: string,
): IndustrialSeriesSeoPage | undefined {
  return pagesByPath.get(path) ?? LEGACY_CHECK_VALVE_PATH_BY_SLUG.get(path);
}

export function findIndustrialSeriesCatalogProduct(
  products: PublicCatalogProduct[],
  page: IndustrialSeriesSeoPage,
): PublicCatalogProduct | undefined {
  return products.find((product) => {
    if (product.category !== page.catalogCategoryId) return false;
    if (product.subcategory !== page.catalogSubcategoryId) return false;
    if (product.dn !== page.dn || product.pn !== page.pn) return false;
    return (product.model || "").toLowerCase() === page.model.toLowerCase();
  });
}

export function getIndustrialSeriesSeoPageForProduct(
  product: PublicCatalogProduct,
): IndustrialSeriesSeoPage | undefined {
  return INDUSTRIAL_SERIES_SEO_PAGES.find((page) =>
    findIndustrialSeriesCatalogProduct([product], page),
  );
}

