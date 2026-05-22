import "server-only";

import ExcelJS from "exceljs";

import { IMPORT_COLUMNS, MAX_IMPORT_ROWS } from "./columns";

/**
 * Собирает Excel-шаблон для массовой загрузки товаров.
 * Содержит лист «Товары» с шапкой и примером, и лист «Инструкция».
 */
export async function buildProductsImportTemplate(): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "MANSVALVE Admin";
  wb.created = new Date();

  const sheet = wb.addWorksheet("Товары", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  sheet.columns = IMPORT_COLUMNS.map((column) => ({
    header: column.header,
    key: column.key,
    width: column.width ?? 22,
  }));

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
  headerRow.height = 28;
  for (let i = 1; i <= IMPORT_COLUMNS.length; i++) {
    const cell = headerRow.getCell(i);
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFEFF2F7" },
    };
    cell.border = {
      bottom: { style: "thin", color: { argb: "FFCBD5E1" } },
    };
  }

  const exampleRow: Record<string, string | number | null> = {};
  for (const column of IMPORT_COLUMNS) {
    if (!column.example) continue;
    if (column.key === "dn" || column.key === "pn" || column.key === "weight") {
      exampleRow[column.key] = Number(column.example);
    } else if (column.key === "price") {
      exampleRow[column.key] = Number(column.example);
    } else {
      exampleRow[column.key] = column.example;
    }
  }
  sheet.addRow(exampleRow);
  const example = sheet.getRow(2);
  example.font = { color: { argb: "FF94A3B8" }, italic: true };
  example.commit();

  // Закрепляем колонки и форматируем числовые.
  sheet.getColumn("dn").numFmt = "0";
  sheet.getColumn("pn").numFmt = "0";
  sheet.getColumn("price").numFmt = "0.00";
  sheet.getColumn("weight").numFmt = "0.000";

  // Лист инструкции.
  const info = wb.addWorksheet("Инструкция", {
    properties: { tabColor: { argb: "FF2563EB" } },
  });
  info.columns = [
    { header: "Поле", key: "field", width: 32 },
    { header: "Обязательное", key: "required", width: 14 },
    { header: "Описание", key: "description", width: 72 },
    { header: "Пример", key: "example", width: 40 },
  ];
  info.getRow(1).font = { bold: true };

  for (const column of IMPORT_COLUMNS) {
    info.addRow({
      field: column.header,
      required: column.required ? "да" : "нет",
      description: column.description,
      example: column.example ?? "",
    });
  }

  info.addRow({});
  info.addRow({ field: "Как это работает" });
  info.getRow(info.rowCount).font = { bold: true };
  const rules = [
    `1) Заполняйте по одному товару в строке. Максимум ${MAX_IMPORT_ROWS} строк за импорт.`,
    "2) Slug генерируется автоматически: model + DN + PN. Дубликаты не создаются — товары с одинаковым slug отмечаются ошибкой в превью.",
    "3) Существующий товар обновляется только при точном совпадении по slug (или по model+DN+PN, если slug автогенерируется). Ручные SEO/описания не перезаписываются пустыми значениями.",
    "4) SEO title/description/H1 и canonical берутся из buildPublicProductView() — повторный SEO билдер не нужен.",
    "5) Категорию и подкатегорию можно указывать slug или названием.",
    "6) Изображение указывайте через filename (как в storage_key или конце URL) либо полный URL. Файл должен быть уже загружен в медиатеку.",
    "7) Статус публикации: active (видим на сайте) или hidden. По умолчанию active.",
    "8) Сначала вы увидите превью с действиями (create/update/skip/error). Применить импорт можно только после превью.",
  ];
  for (const rule of rules) {
    info.addRow({ field: "", description: rule });
  }

  const buffer = await wb.xlsx.writeBuffer();
  return Buffer.from(buffer as ArrayBuffer);
}
