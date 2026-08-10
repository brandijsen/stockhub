import type { Request, Response } from "express";

import { prisma } from "../../../lib/prisma";
import type { AuthenticatedRequest } from "../../../middleware/require-auth";
import { listNotificationsQuerySchema } from "../schemas";
import { serializeNotification } from "../serialize";

export async function listNotifications(
  req: Request,
  res: Response,
): Promise<void> {
  const session = (req as AuthenticatedRequest).sessionUser;
  const parsed = listNotificationsQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten(),
    });
    return;
  }

  const { cursor, limit } = parsed.data;

  try {
    const cursorNotification = cursor
      ? await prisma.notification.findFirst({
          where: { id: cursor, userId: session.sub },
          select: { createdAt: true },
        })
      : null;

    if (cursor && !cursorNotification) {
      res.status(400).json({ error: "Invalid cursor" });
      return;
    }

    const rows = await prisma.notification.findMany({
      where: {
        userId: session.sub,
        ...(cursorNotification
          ? { createdAt: { lt: cursorNotification.createdAt } }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
    });

    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? (page[page.length - 1]?.id ?? null) : null;

    res.json({
      notifications: page.map(serializeNotification),
      nextCursor,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load notifications" });
  }
}
