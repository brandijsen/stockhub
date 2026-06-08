import type { Prisma } from "@prisma/client";

import { prisma } from "../../lib/prisma";
import type { listArticlesQuerySchema } from "./schemas";
import type { z } from "zod";

type ListArticlesQuery = z.infer<typeof listArticlesQuerySchema>;

export function buildArticleListWhere(
  query: Pick<
    ListArticlesQuery,
    "q" | "categoryId" | "brandId" | "active" | "lowStock"
  >,
): Prisma.ArticleWhereInput {
  const activeOnly = query.active === "true";
  const lowStockOnly = query.lowStock === "true";

  return {
    ...(activeOnly ? { isActive: true } : {}),
    ...(query.categoryId ? { categoryId: query.categoryId } : {}),
    ...(query.brandId ? { brandId: query.brandId } : {}),
    ...(lowStockOnly
      ? { stock: { lt: prisma.article.fields.minThreshold } }
      : {}),
    ...(query.q
      ? {
          OR: [
            { code: { contains: query.q, mode: "insensitive" } },
            { name: { contains: query.q, mode: "insensitive" } },
            { barcode: { contains: query.q, mode: "insensitive" } },
          ],
        }
      : {}),
  };
}
