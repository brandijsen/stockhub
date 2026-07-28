import type { Request, Response } from "express";

import { notifyStockAdjustment } from "../../../lib/notify-stock-adjustment";
import { prisma } from "../../../lib/prisma";
import { displayName } from "../../auth/session";
import type { AuthenticatedRequest } from "../../../middleware/require-auth";
import { adjustStockSchema } from "../schemas";
import { articleInclude, serializeArticle } from "../serialize";

export async function adjustArticleStock(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = req.params;
  const parsed = adjustStockSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten(),
    });
    return;
  }

  const session = (req as AuthenticatedRequest).sessionUser;
  const { delta, note } = parsed.data;
  const trimmedNote = note?.trim() ? note.trim() : null;

  try {
    const existing = await prisma.article.findUnique({
      where: { id },
      select: {
        id: true,
        code: true,
        name: true,
        stock: true,
      },
    });

    if (!existing) {
      res.status(404).json({ error: "Article not found" });
      return;
    }

    const newStock = existing.stock + delta;
    if (newStock < 0) {
      res.status(400).json({
        error: `Stock cannot go below zero (current ${existing.stock}, delta ${delta})`,
      });
      return;
    }

    const actor = await prisma.user.findUnique({
      where: { id: session.sub },
      select: { firstName: true, lastName: true },
    });
    const actorName = actor ? displayName(actor) : "A team member";

    const article = await prisma.$transaction(async (tx) => {
      await tx.article.update({
        where: { id },
        data: { stock: newStock },
      });

      await tx.movement.create({
        data: {
          type: "ADJUSTMENT",
          delta,
          articleId: id,
          userId: session.sub,
          note: trimmedNote,
        },
      });

      return tx.article.findUniqueOrThrow({
        where: { id },
        include: articleInclude,
      });
    });

    await notifyStockAdjustment({
      articleId: existing.id,
      articleCode: existing.code,
      articleName: existing.name,
      delta,
      newStock,
      actorUserId: session.sub,
      actorName,
      note: trimmedNote,
    });

    res.json({ article: serializeArticle(article) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to adjust stock" });
  }
}
