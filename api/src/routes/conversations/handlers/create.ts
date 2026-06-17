import type { Request, Response } from "express";

import { findOrCreateDirectConversation } from "../../../lib/direct-conversation";
import type { AuthenticatedRequest } from "../../../middleware/require-auth";
import { prisma } from "../../../lib/prisma";
import { createConversationSchema } from "../schemas";
import {
  buildConversationSummary,
  countUnreadMessages,
} from "../serialize";

export async function createConversation(
  req: Request,
  res: Response,
): Promise<void> {
  const { sub: currentUserId } = (req as AuthenticatedRequest).sessionUser;
  const parsed = createConversationSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten(),
    });
    return;
  }

  const { withUserId } = parsed.data;

  if (withUserId === currentUserId) {
    res.status(400).json({ error: "You cannot start a chat with yourself" });
    return;
  }

  try {
    const target = await prisma.user.findUnique({
      where: { id: withUserId },
      select: { id: true },
    });

    if (!target) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const conversation = await findOrCreateDirectConversation(
      currentUserId,
      withUserId,
    );

    const membership = conversation.participants.find(
      (p) => p.userId === currentUserId,
    );
    const unreadCount = await countUnreadMessages(
      conversation.id,
      currentUserId,
      membership?.lastReadAt ?? null,
    );

    res.status(201).json({
      conversation: buildConversationSummary(
        conversation,
        currentUserId,
        unreadCount,
      ),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to start conversation" });
  }
}
