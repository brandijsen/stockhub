import type { Request, Response } from "express";

import {
  buildArticlesWorkbook,
  exportFilename,
} from "../../../lib/article-excel";
import { prisma } from "../../../lib/prisma";
import { buildArticleListWhere } from "../list-where";
import {
  ARTICLES_EXPORT_MAX_ROWS,
  exportArticlesQuerySchema,
} from "../schemas";
import { articleInclude } from "../serialize";

export async function exportArticles(
  req: Request,
  res: Response,
): Promise<void> {
  const parsed = exportArticlesQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten(),
    });
    return;
  }

  const where = buildArticleListWhere(parsed.data);

  try {
    const total = await prisma.article.count({ where });
    if (total > ARTICLES_EXPORT_MAX_ROWS) {
      res.status(400).json({
        error: `Export limited to ${ARTICLES_EXPORT_MAX_ROWS} rows. Narrow your filters (${total} match).`,
      });
      return;
    }

    const articles = await prisma.article.findMany({
      where,
      include: articleInclude,
      orderBy: [{ name: "asc" }, { code: "asc" }],
    });

    const buffer = buildArticlesWorkbook(articles);
    const filename = exportFilename();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to export articles" });
  }
}
