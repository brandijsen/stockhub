import type { Request, Response } from "express";

import { prisma } from "../../../lib/prisma";
import type { AuthenticatedRequest } from "../../../middleware/require-auth";
import { serializeNotification } from "../serialize";

const NOTIFICATIONS_LIST_LIMIT = 50;

export async function listNotifications(
  req: Request,
  res: Response,
): Promise<void> {
  const session = (req as AuthenticatedRequest).sessionUser;

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: session.sub },
      orderBy: { createdAt: "desc" },
      take: NOTIFICATIONS_LIST_LIMIT,
    });

    res.json({
      notifications: notifications.map(serializeNotification),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load notifications" });
  }
}
