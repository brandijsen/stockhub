import type { Request, Response } from "express";

import { prisma } from "../../../lib/prisma";
import { listArticlesQuerySchema } from "../schemas";
import { buildArticleListWhere } from "../list-where";
import { articleInclude, serializeArticle } from "../serialize";

export async function listArticles(req: Request, res: Response): Promise<void> {
  const parsed = listArticlesQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten(),
    });
    return;
  }

  const { page, limit, ...filterQuery } = parsed.data;
  const skip = (page - 1) * limit;
  const where = buildArticleListWhere(filterQuery);

  try {
    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: articleInclude,
        orderBy: [{ name: "asc" }, { code: "asc" }],
        skip,
        take: limit,
      }),
      prisma.article.count({ where }),
    ]);

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    res.json({
      articles: articles.map(serializeArticle),
      total,
      page,
      limit,
      totalPages,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load articles" });
  }
}
