import type { Request, Response } from "express";
import { Prisma } from "@prisma/client";

import { resolveSimpleCustomAttributes } from "../../../lib/article-custom-attributes";
import {
  attributeValuesFromArticleId,
  findArticleByVariantBarcode,
} from "../../../lib/article-variant";
import { isPrismaUniqueViolation } from "../../../lib/prisma-errors";
import { prisma } from "../../../lib/prisma";
import { replaceArticleAttributeValues } from "../attribute-values";
import { updateArticleSchema } from "../schemas";
import { articleInclude, serializeArticle } from "../serialize";

export async function updateArticle(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = req.params;
  const parsed = updateArticleSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten(),
    });
    return;
  }

  const data = parsed.data;
  const {
    customAttributes,
    price,
    stock,
    brandId,
    categoryId,
    ...scalarFields
  } = data;

  try {
    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: "Article not found" });
      return;
    }

    let resolvedAttributes:
      | Awaited<ReturnType<typeof resolveSimpleCustomAttributes>>
      | undefined;

    if (customAttributes !== undefined) {
      try {
        resolvedAttributes = await resolveSimpleCustomAttributes(customAttributes);
      } catch (e) {
        res.status(400).json({
          error: e instanceof Error ? e.message : "Invalid custom attributes",
        });
        return;
      }
    }

    if (brandId) {
      const brand = await prisma.brand.findUnique({ where: { id: brandId } });
      if (!brand) {
        res.status(400).json({ error: "Brand not found" });
        return;
      }
    }

    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });
      if (!category) {
        res.status(400).json({ error: "Category not found" });
        return;
      }
    }

    const nextName = data.name ?? existing.name;
    const nextBrandId =
      brandId !== undefined ? brandId : existing.brandId;
    const nextCategoryId =
      categoryId !== undefined ? categoryId : existing.categoryId;
    const nextAttributeValues =
      resolvedAttributes !== undefined
        ? resolvedAttributes
        : await attributeValuesFromArticleId(id);

    const { barcode: nextBarcode, existing: variantDuplicate } =
      await findArticleByVariantBarcode(
        {
          name: nextName,
          brandId: nextBrandId,
          categoryId: nextCategoryId,
          attributeValues: nextAttributeValues,
        },
        id,
      );

    if (variantDuplicate) {
      res.status(409).json({
        error: "An article with this variant already exists",
        code: variantDuplicate.code,
      });
      return;
    }

    const updateData: Prisma.ArticleUpdateInput = { ...scalarFields };
    if (nextBarcode !== existing.barcode) {
      updateData.barcode = nextBarcode;
    }
    if (price !== undefined) {
      updateData.price = price == null ? null : new Prisma.Decimal(price);
    }
    if (stock !== undefined) {
      updateData.stock = stock;
    }
    if (brandId !== undefined) {
      updateData.brand = brandId
        ? { connect: { id: brandId } }
        : { disconnect: true };
    }
    if (categoryId !== undefined) {
      updateData.category = categoryId
        ? { connect: { id: categoryId } }
        : { disconnect: true };
    }

    await prisma.article.update({
      where: { id },
      data: updateData,
    });

    if (resolvedAttributes !== undefined) {
      await replaceArticleAttributeValues(id, resolvedAttributes);
    }

    const full = await prisma.article.findUniqueOrThrow({
      where: { id },
      include: articleInclude,
    });

    res.json({ article: serializeArticle(full) });
  } catch (e) {
    if (isPrismaUniqueViolation(e, "barcode")) {
      res.status(409).json({ error: "Barcode already exists" });
      return;
    }
    console.error(e);
    res.status(500).json({ error: "Failed to update article" });
  }
}
