import type { Request, Response } from "express";

import { prisma } from "../../../lib/prisma";
import { articleInclude, serializeArticle } from "../serialize";

export async function getArticle(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    const article = await prisma.article.findUnique({
      where: { id },
      include: articleInclude,
    });

    if (!article) {
      res.status(404).json({ error: "Article not found" });
      return;
    }

    res.json({ article: serializeArticle(article) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load article" });
  }
}
