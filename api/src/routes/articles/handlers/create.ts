import type { Request, Response } from "express";

import { Prisma } from "@prisma/client";



import { generateUniqueArticleCode } from "../../../lib/article-code";

import { resolveSimpleCustomAttributes } from "../../../lib/article-custom-attributes";

import { findArticleByVariantBarcode } from "../../../lib/article-variant";

import { isPrismaUniqueViolation } from "../../../lib/prisma-errors";

import { prisma } from "../../../lib/prisma";

import { replaceArticleAttributeValues } from "../attribute-values";

import { createArticleSchema } from "../schemas";

import { articleInclude, serializeArticle } from "../serialize";



export async function createArticle(

  req: Request,

  res: Response,

): Promise<void> {

  const parsed = createArticleSchema.safeParse(req.body);

  if (!parsed.success) {

    res.status(400).json({

      error: "Validation failed",

      details: parsed.error.flatten(),

    });

    return;

  }



  const data = parsed.data;

  const { customAttributes, price, stock, ...articleFields } = data;



  try {

    let attributeValues;

    try {

      attributeValues = await resolveSimpleCustomAttributes(customAttributes);

    } catch (e) {

      res.status(400).json({

        error: e instanceof Error ? e.message : "Invalid custom attributes",

      });

      return;

    }



    if (data.brandId) {

      const brand = await prisma.brand.findUnique({ where: { id: data.brandId } });

      if (!brand) {

        res.status(400).json({ error: "Brand not found" });

        return;

      }

    }



    if (data.categoryId) {

      const category = await prisma.category.findUnique({

        where: { id: data.categoryId },

      });

      if (!category) {

        res.status(400).json({ error: "Category not found" });

        return;

      }

    }



    const { barcode, existing: variantDuplicate } =

      await findArticleByVariantBarcode({

        name: data.name,

        brandId: data.brandId ?? null,

        categoryId: data.categoryId ?? null,

        attributeValues,

      });



    if (variantDuplicate) {

      res.status(409).json({

        error: "An article with this variant already exists",

        code: variantDuplicate.code,

      });

      return;

    }



    const code = await generateUniqueArticleCode();



    const article = await prisma.article.create({

      data: {

        code,

        barcode,

        stock,

        ...articleFields,

        price: price == null ? null : new Prisma.Decimal(price),

        brandId: data.brandId ?? null,

        categoryId: data.categoryId ?? null,

      },

      include: articleInclude,

    });



    if (attributeValues.length) {

      await replaceArticleAttributeValues(article.id, attributeValues);

    }



    const full = await prisma.article.findUniqueOrThrow({

      where: { id: article.id },

      include: articleInclude,

    });



    res.status(201).json({ article: serializeArticle(full) });

  } catch (e) {

    if (isPrismaUniqueViolation(e, "code")) {

      res.status(409).json({ error: "Article code already exists" });

      return;

    }

    if (isPrismaUniqueViolation(e, "barcode")) {

      res.status(409).json({ error: "Barcode already exists" });

      return;

    }

    console.error(e);

    res.status(500).json({ error: "Failed to create article" });

  }

}


