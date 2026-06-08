import type { Request, Response } from "express";

import { deleteArticleImageFile } from "../../../lib/article-image";
import { isPrismaForeignKeyViolation } from "../../../lib/prisma-errors";
import { prisma } from "../../../lib/prisma";

export async function deleteArticle(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = req.params;

  try {
    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: "Article not found" });
      return;
    }

    await deleteArticleImageFile(existing.imageUrl);
    await prisma.article.delete({ where: { id } });
    res.json({ ok: true });
  } catch (e) {
    if (isPrismaForeignKeyViolation(e)) {
      res.status(409).json({
        error: "Article is referenced by orders and cannot be deleted",
      });
      return;
    }
    console.error(e);
    res.status(500).json({ error: "Failed to delete article" });
  }
}
