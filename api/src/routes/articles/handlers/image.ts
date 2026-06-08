import type { Request, Response } from "express";

import {
  contentTypeForStorageKey,
  deleteArticleImageFile,
  resolveStoredImagePath,
  saveArticleImageFile,
} from "../../../lib/article-image";
import { prisma } from "../../../lib/prisma";
import { articleInclude, serializeArticle } from "../serialize";

export async function uploadArticleImage(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = req.params;
  const file = req.file;

  if (!file) {
    res.status(400).json({ error: "Image file is required" });
    return;
  }

  try {
    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: "Article not found" });
      return;
    }

    const storageKey = await saveArticleImageFile(id, file.buffer, file.mimetype);

    const article = await prisma.article.update({
      where: { id },
      data: { imageUrl: storageKey },
      include: articleInclude,
    });

    res.json({ article: serializeArticle(article) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to upload image" });
  }
}

export async function getArticleImage(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = req.params;

  try {
    const article = await prisma.article.findUnique({
      where: { id },
      select: { imageUrl: true },
    });

    if (!article?.imageUrl) {
      res.status(404).json({ error: "Image not found" });
      return;
    }

    const filePath = resolveStoredImagePath(article.imageUrl);
    res.setHeader("Content-Type", contentTypeForStorageKey(article.imageUrl));
    res.setHeader("Cache-Control", "private, max-age=3600");
    res.sendFile(filePath, (err) => {
      if (err && !res.headersSent) {
        res.status(404).json({ error: "Image not found" });
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load image" });
  }
}

export async function deleteArticleImage(
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

    await prisma.article.update({
      where: { id },
      data: { imageUrl: null },
    });

    if (existing.imageUrl) {
      await deleteArticleImageFile(existing.imageUrl);
    }

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to remove image" });
  }
}
