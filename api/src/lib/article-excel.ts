import type {
  AttributeDefinition,
  AttributeOption,
  AttributeValue,
  Brand,
  Category,
} from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import * as XLSX from "xlsx";

import type { SimpleCustomAttribute } from "./article-custom-attributes";

export const ARTICLE_EXCEL_HEADERS = [
  "Code",
  "Name",
  "Description",
  "Stock",
  "Min threshold",
  "Active",
  "Barcode",
  "Price",
  "Weight (grams)",
  "Brand",
  "Category",
  "Attributes",
] as const;

type ArticleExportRow = {
  code: string;
  name: string;
  description: string | null;
  stock: number;
  minThreshold: number;
  isActive: boolean;
  barcode: string | null;
  price: Decimal | null;
  weightGrams: number | null;
  brand: Brand | null;
  category: Category | null;
  attributeValues: (AttributeValue & {
    definition: AttributeDefinition;
    option: AttributeOption | null;
  })[];
};

function decimalToNumber(value: Decimal | null): number | null {
  if (value === null) {
    return null;
  }
  return value.toNumber();
}

function formatAttributeValue(
  value: ArticleExportRow["attributeValues"][number],
): string {
  if (value.valueText != null && value.valueText.trim() !== "") {
    return value.valueText;
  }
  if (value.option) {
    return value.option.label ?? value.option.value;
  }
  if (value.valueNumber != null) {
    return String(decimalToNumber(value.valueNumber));
  }
  if (value.valueBoolean != null) {
    return value.valueBoolean ? "Yes" : "No";
  }
  return "";
}

export function formatAttributesForExcel(
  attributeValues: ArticleExportRow["attributeValues"],
): string {
  return attributeValues
    .map((value) => {
      const name = value.definition.label || value.definition.key;
      const formatted = formatAttributeValue(value);
      if (!name || !formatted) {
        return null;
      }
      return `${name}: ${formatted}`;
    })
    .filter((part): part is string => part != null)
    .join("; ");
}

function articleToExcelRow(article: ArticleExportRow): Record<string, string | number> {
  return {
    Code: article.code,
    Name: article.name,
    Description: article.description ?? "",
    Stock: article.stock,
    "Min threshold": article.minThreshold,
    Active: article.isActive ? "Yes" : "No",
    Barcode: article.barcode ?? "",
    Price: decimalToNumber(article.price) ?? "",
    "Weight (grams)": article.weightGrams ?? "",
    Brand: article.brand?.name ?? "",
    Category: article.category?.name ?? "",
    Attributes: formatAttributesForExcel(article.attributeValues),
  };
}

export function buildArticlesWorkbook(articles: ArticleExportRow[]): Buffer {
  const rows = articles.map(articleToExcelRow);
  const sheet = XLSX.utils.json_to_sheet(rows, {
    header: [...ARTICLE_EXCEL_HEADERS],
  });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Articles");
  return Buffer.from(
    XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }),
  );
}

const HEADER_MAP: Record<string, keyof ParsedArticleRow> = {
  code: "code",
  name: "name",
  description: "description",
  stock: "stock",
  "min threshold": "minThreshold",
  active: "isActive",
  barcode: "barcode",
  price: "price",
  "weight (grams)": "weightGrams",
  brand: "brandName",
  category: "categoryName",
  attributes: "attributesText",
};

export type ParsedArticleRow = {
  rowNumber: number;
  code: string;
  name: string;
  description: string;
  stock: number;
  minThreshold: number;
  isActive: boolean;
  barcode: string;
  price: number | null;
  weightGrams: number | null;
  brandName: string;
  categoryName: string;
  attributesText: string;
  customAttributes: SimpleCustomAttribute[];
};

function normalizeHeader(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function cellString(value: unknown): string {
  if (value == null) {
    return "";
  }
  return String(value).trim();
}

function cellNumber(value: unknown, fallback = 0): number {
  if (value == null || value === "") {
    return fallback;
  }
  const num = Number(value);
  if (!Number.isFinite(num)) {
    throw new Error(`Invalid number: ${String(value)}`);
  }
  return num;
}

function cellOptionalNumber(value: unknown): number | null {
  if (value == null || value === "") {
    return null;
  }
  const num = Number(value);
  if (!Number.isFinite(num)) {
    throw new Error(`Invalid number: ${String(value)}`);
  }
  return num;
}

function parseActiveCell(value: unknown): boolean {
  const normalized = cellString(value).toLowerCase();
  if (["yes", "true", "1", "y"].includes(normalized)) {
    return true;
  }
  if (["no", "false", "0", "n", ""].includes(normalized)) {
    return false;
  }
  throw new Error(`Invalid Active value: ${String(value)}`);
}

export function parseAttributesCell(value: string): SimpleCustomAttribute[] {
  const text = value.trim();
  if (!text) {
    return [];
  }

  const pairs: SimpleCustomAttribute[] = [];
  for (const part of text.split(";")) {
    const segment = part.trim();
    if (!segment) {
      continue;
    }
    const colonIndex = segment.indexOf(":");
    if (colonIndex === -1) {
      throw new Error(`Invalid attribute segment: ${segment}`);
    }
    const name = segment.slice(0, colonIndex).trim();
    const attrValue = segment.slice(colonIndex + 1).trim();
    if (!name || !attrValue) {
      throw new Error(`Invalid attribute segment: ${segment}`);
    }
    pairs.push({ name, value: attrValue });
  }
  return pairs;
}

export function parseArticlesWorkbook(buffer: Buffer): ParsedArticleRow[] {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error("Workbook has no sheets");
  }

  const sheet = workbook.Sheets[sheetName];
  const matrix = XLSX.utils.sheet_to_json<(string | number | boolean | null)[]>(
    sheet,
    { header: 1, defval: "" },
  );

  if (matrix.length === 0) {
    throw new Error("Worksheet is empty");
  }

  const headerRow = matrix[0] ?? [];
  const columnKeys = headerRow.map((header) => {
    const normalized = normalizeHeader(header);
    const mapped = HEADER_MAP[normalized];
    if (!mapped && normalized) {
      throw new Error(`Unknown column: ${String(header)}`);
    }
    return mapped ?? null;
  });

  if (!columnKeys.includes("name")) {
    throw new Error('Missing required column: "Name"');
  }

  const rows: ParsedArticleRow[] = [];
  for (let index = 1; index < matrix.length; index += 1) {
    const rawRow = matrix[index] ?? [];
    if (rawRow.every((cell) => cellString(cell) === "")) {
      continue;
    }

    const rowNumber = index + 1;
    const parsed: Partial<ParsedArticleRow> = { rowNumber };

    for (let col = 0; col < columnKeys.length; col += 1) {
      const key = columnKeys[col];
      if (!key) {
        continue;
      }
      parsed[key] = rawRow[col] as never;
    }

    try {
      const attributesText = cellString(parsed.attributesText);
      const row: ParsedArticleRow = {
        rowNumber,
        code: cellString(parsed.code),
        name: cellString(parsed.name),
        description: cellString(parsed.description),
        stock: cellNumber(parsed.stock, 0),
        minThreshold: cellNumber(parsed.minThreshold, 0),
        isActive: parseActiveCell(parsed.isActive),
        barcode: cellString(parsed.barcode),
        price: cellOptionalNumber(parsed.price),
        weightGrams: cellOptionalNumber(parsed.weightGrams),
        brandName: cellString(parsed.brandName),
        categoryName: cellString(parsed.categoryName),
        attributesText,
        customAttributes: parseAttributesCell(attributesText),
      };

      if (!row.name) {
        throw new Error("Name is required");
      }

      rows.push(row);
    } catch (e) {
      throw new Error(
        `Row ${rowNumber}: ${e instanceof Error ? e.message : "Invalid row"}`,
      );
    }
  }

  return rows;
}

export function exportFilename(date = new Date()): string {
  const stamp = date.toISOString().slice(0, 10);
  return `articles-${stamp}.xlsx`;
}
