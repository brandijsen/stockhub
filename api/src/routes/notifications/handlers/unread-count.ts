import type { Request, Response } from "express";

import { prisma } from "../../../lib/prisma";
import type { AuthenticatedRequest } from "../../../middleware/require-auth";

export async function unreadNotificationsCount(
  req: Request,
  res: Response,
): Promise<void> {
  const session = (req as AuthenticatedRequest).sessionUser;

  try {
    const total = await prisma.notification.count({
      where: {
        userId: session.sub,
        readAt: null,
      },
    });
    res.json({ total });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load unread count" });
  }
}
