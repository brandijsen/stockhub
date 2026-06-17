import type { Request, Response } from "express";

import { getConversationParticipant } from "../../../lib/direct-conversation";
import type { AuthenticatedRequest } from "../../../middleware/require-auth";
import { prisma } from "../../../lib/prisma";

export async function unreadCount(
  req: Request,
  res: Response,
): Promise<void> {
  const { sub: currentUserId } = (req as AuthenticatedRequest).sessionUser;

  try {
    const memberships = await prisma.conversationParticipant.findMany({
      where: { userId: currentUserId },
      select: {
        conversationId: true,
        lastReadAt: true,
      },
    });

    let total = 0;
    for (const membership of memberships) {
      const count = await prisma.message.count({
        where: {
          conversationId: membership.conversationId,
          senderId: { not: currentUserId },
          ...(membership.lastReadAt
            ? { createdAt: { gt: membership.lastReadAt } }
            : {}),
        },
      });
      total += count;
    }

    res.json({ total });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load unread count" });
  }
}

export async function markConversationRead(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = req.params;
  const { sub: currentUserId } = (req as AuthenticatedRequest).sessionUser;

  try {
    const membership = await getConversationParticipant(id, currentUserId);
    if (!membership) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }

    await prisma.conversationParticipant.update({
      where: { id: membership.id },
      data: { lastReadAt: new Date() },
    });

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to mark conversation as read" });
  }
}
