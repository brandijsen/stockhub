import type { Request, Response } from "express";

import { prisma } from "../../../lib/prisma";
import type { AuthenticatedRequest } from "../../../middleware/require-auth";
import { serializeNotification } from "../serialize";

export async function markNotificationRead(
  req: Request,
  res: Response,
): Promise<void> {
  const session = (req as AuthenticatedRequest).sessionUser;
  const { id } = req.params;

  try {
    const existing = await prisma.notification.findFirst({
      where: { id, userId: session.sub },
    });
    if (!existing) {
      res.status(404).json({ error: "Notification not found" });
      return;
    }

    const notification = await prisma.notification.update({
      where: { id },
      data: { readAt: existing.readAt ?? new Date() },
    });

    res.json({ notification: serializeNotification(notification) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
}
