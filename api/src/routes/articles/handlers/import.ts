import type { Request, Response } from "express";
import { Prisma } from "@prisma/client";

import { generateUniqueArticleCode } from "../../../lib/article-code";
import { resolveSimpleCustomAttributes } from "../../../lib/article-custom-attributes";
import {
  parseArticlesWorkbook,
  type ParsedArticleRow,
} from "../../../lib/article-excel";
import { findArticleByVariantBarcode } from "../../../lib/article-variant";
import {
  isPrismaForeignKeyViolation,
  isPrismaUniqueViolation,
} from "../../../lib/prisma-errors";
import { prisma } from "../../../lib/prisma";
import { replaceArticleAttributeValues } from "../attribute-values";
import { ARTICLES_IMPORT_MAX_ROWS } from "../schemas";

type ImportRowError = {
  row: number;
  message: string;
};

async function lookupBrandId(name: string): Promise<string | null> {
  if (!name) {
    return null;
  }
  const brand = await prisma.brand.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
    select: { id: true },
  });
  if (!brand) {
    throw new Error(`Brand not found: ${name}`);
  }
  return brand.id;
}

async function lookupCategoryId(name: string): Promise<string | null> {
  if (!name) {
    return null;
  }
  const category = await prisma.category.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
    select: { id: true },
  });
  if (!category) {
    throw new Error(`Category not found: ${name}`);
  }
  return category.id;
}

async function importArticleRow(
  row: ParsedArticleRow,
): Promise<"created" | "updated"> {
  const brandId = await lookupBrandId(row.brandName);
  const categoryId = await lookupCategoryId(row.categoryName);
  const attributeValues = await resolveSimpleCustomAttributes(
    row.customAttributes,
  );

  const existingByCode = row.code
    ? await prisma.article.findUnique({
        where: { code: row.code },
        select: { id: true, barcode: true },
      })
    : null;

  if (existingByCode) {
    const { barcode: nextBarcode, existing: variantDuplicate } =
      await findArticleByVariantBarcode(
        {
          name: row.name,
          brandId,
          categoryId,
          attributeValues,
        },
        existingByCode.id,
      );

    if (variantDuplicate) {
      throw new Error(
        `Variant already exists on article ${variantDuplicate.code}`,
      );
    }

    await prisma.article.update({
      where: { id: existingByCode.id },
      data: {
        name: row.name,
        description: row.description || null,
        stock: row.stock,
        minThreshold: row.minThreshold,
        isActive: row.isActive,
        ...(nextBarcode !== existingByCode.barcode
          ? { barcode: nextBarcode }
          : {}),
        price: row.price == null ? null : new Prisma.Decimal(row.price),
        weightGrams: row.weightGrams,
        brandId,
        categoryId,
      },
    });

    await replaceArticleAttributeValues(existingByCode.id, attributeValues);
    return "updated";
  }

  const { barcode, existing: variantDuplicate } =
    await findArticleByVariantBarcode({
      name: row.name,
      brandId,
      categoryId,
      attributeValues,
    });

  if (variantDuplicate) {
    throw new Error(
      `An article with this variant already exists (${variantDuplicate.code})`,
    );
  }

  const code = row.code || (await generateUniqueArticleCode());

  const article = await prisma.article.create({
    data: {
      code,
      barcode,
      name: row.name,
      description: row.description || null,
      stock: row.stock,
      minThreshold: row.minThreshold,
      isActive: row.isActive,
      price: row.price == null ? null : new Prisma.Decimal(row.price),
      weightGrams: row.weightGrams,
      brandId,
      categoryId,
    },
    select: { id: true },
  });

  if (attributeValues.length) {
    await replaceArticleAttributeValues(article.id, attributeValues);
  }

  return "created";
}

function mapRowError(row: ParsedArticleRow, error: unknown): ImportRowError {
  if (isPrismaUniqueViolation(error, "barcode")) {
    return { row: row.rowNumber, message: "Barcode already exists" };
  }
  if (isPrismaUniqueViolation(error, "code")) {
    return { row: row.rowNumber, message: "Code already exists" };
  }
  if (isPrismaForeignKeyViolation(error)) {
    return { row: row.rowNumber, message: "Invalid brand or category reference" };
  }
  return {
    row: row.rowNumber,
    message: error instanceof Error ? error.message : "Import failed",
  };
}

export async function importArticles(
  req: Request,
  res: Response,
): Promise<void> {
  const file = req.file;
  if (!file?.buffer?.length) {
    res.status(400).json({ error: "Excel file is required" });
    return;
  }

  let rows: ParsedArticleRow[];
  try {
    rows = parseArticlesWorkbook(file.buffer);
  } catch (e) {
    res.status(400).json({
      error: e instanceof Error ? e.message : "Invalid Excel file",
    });
    return;
  }

  if (rows.length === 0) {
    res.status(400).json({ error: "No data rows found in worksheet" });
    return;
  }

  if (rows.length > ARTICLES_IMPORT_MAX_ROWS) {
    res.status(400).json({
      error: `Import limited to ${ARTICLES_IMPORT_MAX_ROWS} rows per file`,
    });
    return;
  }

  let created = 0;
  let updated = 0;
  const errors: ImportRowError[] = [];

  for (const row of rows) {
    try {
      const result = await importArticleRow(row);
      if (result === "created") {
        created += 1;
      } else {
        updated += 1;
      }
    } catch (e) {
      errors.push(mapRowError(row, e));
    }
  }

  res.json({ created, updated, errors });
}
