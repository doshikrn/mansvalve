import "server-only";

import ExcelJS from "exceljs";

import {
  HEADER_TO_KEY,
  IMPORT_COLUMNS,
  MAX_IMPORT_ROWS,
  normalizeHeader,
  type ImportColumnKey,
} from "./columns";

export interface ParsedImportRow {
  rowNumber: number; // 1-based номер строки в Excel (с учётом шапки)
  values: Partial<Record<ImportColumnKey, string>>;
}

export interface ParsedImportResult {
  rows: ParsedImportRow[];
  unknownHeaders: string[];
  truncated: boolean;
}

function stripBomAndTrim(s: string): string {
  return s.replace(/^\uFEFF/, "").trim();
}

function cellToString(cell: ExcelJS.Cell | undefined): string {
  if (!cell) return "";
  const value = cell.value;
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return stripBomAndTrim(value);
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  if (value instanceof Date) return value.toISOString();
  // Rich text { richText: [{ text }] }
  if (typeof value === "object") {
    if ("text" in value && typeof (value as { text: unknown }).text === "string") {
      return stripBomAndTrim((value as { text: string }).text);
    }
    if (
      "richText" in value &&
      Array.isArray((value as { richText?: unknown[] }).richText)
    ) {
      const parts = (value as { richText: Array<{ text?: string }> }).richText
        .map((p) => p.text ?? "")
        .join("");
      return stripBomAndTrim(parts);
    }
    if ("hyperlink" in value && typeof (value as { hyperlink?: string }).hyperlink === "string") {
      return stripBomAndTrim((value as { hyperlink: string }).hyperlink);
    }
    if ("result" in value) {
      const result = (value as { result?: unknown }).result;
      if (result != null) return stripBomAndTrim(String(result));
    }
  }
  return stripBomAndTrim(String(value));
}

export async function parseProductsImportWorkbook(
  buffer: ArrayBuffer,
): Promise<ParsedImportResult> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);
  // Лист «Товары» предпочтительно, иначе берём первый.
  const sheet = wb.getWorksheet("Товары") ?? wb.worksheets[0];
  if (!sheet) {
    return { rows: [], unknownHeaders: [], truncated: false };
  }

  const headerRow = sheet.getRow(1);
  const headerToColumn = new Map<ImportColumnKey, number>();
  const unknownHeaders: string[] = [];

  headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    const raw = cellToString(cell);
    if (!raw) return;
    const key = HEADER_TO_KEY[normalizeHeader(raw)];
    if (key) {
      headerToColumn.set(key, colNumber);
    } else {
      unknownHeaders.push(raw);
    }
  });

  const rows: ParsedImportRow[] = [];
  let truncated = false;
  const lastRow = sheet.actualRowCount;

  for (let r = 2; r <= lastRow; r++) {
    if (rows.length >= MAX_IMPORT_ROWS) {
      truncated = true;
      break;
    }
    const row = sheet.getRow(r);
    const values: Partial<Record<ImportColumnKey, string>> = {};
    let hasAny = false;
    for (const column of IMPORT_COLUMNS) {
      const colNumber = headerToColumn.get(column.key);
      if (!colNumber) continue;
      const cell = row.getCell(colNumber);
      const text = cellToString(cell);
      if (text) {
        values[column.key] = text;
        hasAny = true;
      }
    }
    if (!hasAny) continue;
    rows.push({ rowNumber: r, values });
  }

  return { rows, unknownHeaders, truncated };
}
