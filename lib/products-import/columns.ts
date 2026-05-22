/**
 * Колонки Excel-шаблона импорта товаров и их карта в поля БД/формы.
 * Изменять заголовки можно только синхронно с шаблоном и парсером.
 */
export type ImportColumnKey =
  | "name"
  | "category"
  | "subcategory"
  | "model"
  | "dn"
  | "pn"
  | "material"
  | "connectionType"
  | "controlType"
  | "price"
  | "weight"
  | "shortDescription"
  | "longDescription"
  | "standards"
  | "benefits"
  | "applications"
  | "qualityDocuments"
  | "supplyTerms"
  | "imageFilename"
  | "publicationStatus";

export interface ImportColumn {
  key: ImportColumnKey;
  header: string;
  required?: boolean;
  description: string;
  example?: string;
  width?: number;
}

export const IMPORT_COLUMNS: ImportColumn[] = [
  {
    key: "name",
    header: "Название",
    required: true,
    description: "Внутреннее название товара (станет основой публичного, если нет отдельного).",
    example: "Клапан обратный поворотный стальной фланцевый 19с38нж DN50 PN16",
    width: 50,
  },
  {
    key: "category",
    header: "Категория",
    required: true,
    description: "Slug или название категории из админки (например: klapany или «Клапаны обратные»).",
    example: "klapany",
    width: 18,
  },
  {
    key: "subcategory",
    header: "Подкатегория",
    description: "Slug или название подкатегории. Должна принадлежать выбранной категории.",
    example: "povorotnye-flancevye",
    width: 22,
  },
  {
    key: "model",
    header: "Марка / модель",
    description: "Маркировка изделия. Используется для slug и SEO.",
    example: "19с38нж",
    width: 16,
  },
  { key: "dn", header: "DN", description: "Условный проход (число).", example: "50", width: 8 },
  { key: "pn", header: "PN", description: "Номинальное давление (число).", example: "16", width: 8 },
  {
    key: "material",
    header: "Материал",
    description: "Например: Сталь, Чугун, Нержавеющая сталь.",
    example: "Сталь",
    width: 18,
  },
  {
    key: "connectionType",
    header: "Тип соединения",
    description: "Фланцевое, Под приварку, Межфланцевое, Муфтовое.",
    example: "Фланцевое",
    width: 18,
  },
  {
    key: "controlType",
    header: "Тип управления",
    description: "Ручное / Редуктор / Электропривод / Автоматическое.",
    example: "Автоматическое",
    width: 18,
  },
  {
    key: "price",
    header: "Цена",
    description: "Число в тенге. Оставьте пустым — цена будет «по запросу».",
    example: "42816.32",
    width: 12,
  },
  { key: "weight", header: "Вес", description: "Вес в кг (число).", example: "11", width: 8 },
  {
    key: "shortDescription",
    header: "Краткое описание",
    description: "1–2 строки для карточек каталога.",
    example: "Клапан обратный 19с38нж DN50 PN16 для воды, пара и нефтепродуктов.",
    width: 40,
  },
  {
    key: "longDescription",
    header: "Полное описание",
    description: "Основной текст блока «Описание» на странице. Можно несколько абзацев.",
    width: 60,
  },
  {
    key: "standards",
    header: "Стандарты",
    description: "Список через перевод строки или через ; — пункты блока «Стандарты».",
    width: 40,
  },
  {
    key: "benefits",
    header: "Преимущества",
    description: "Список через перевод строки или ;",
    width: 40,
  },
  {
    key: "applications",
    header: "Область применения",
    description: "Список через перевод строки или ;",
    width: 40,
  },
  {
    key: "qualityDocuments",
    header: "Документация и качество",
    description: "Список через перевод строки или ;",
    width: 40,
  },
  {
    key: "supplyTerms",
    header: "Условия поставки",
    description: "Список через перевод строки или ;",
    width: 40,
  },
  {
    key: "imageFilename",
    header: "Изображение filename или URL",
    description:
      "Имя файла из медиатеки (storageKey или конец URL) или полный URL. Файл должен быть уже загружен в админку. На этом этапе изображения не загружаются.",
    width: 36,
  },
  {
    key: "publicationStatus",
    header: "Статус публикации",
    description: "active / hidden. По умолчанию active.",
    example: "active",
    width: 16,
  },
];

export const HEADER_TO_KEY: Record<string, ImportColumnKey> = (() => {
  const map: Record<string, ImportColumnKey> = {};
  for (const column of IMPORT_COLUMNS) {
    map[normalizeHeader(column.header)] = column.key;
  }
  return map;
})();

export function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/\s+/g, " ");
}

export const MAX_IMPORT_ROWS = 500;
export const MAX_IMPORT_FILE_BYTES = 5 * 1024 * 1024; // 5 МБ
