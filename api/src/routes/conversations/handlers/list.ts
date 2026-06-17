import type { Request, Response } from "express";

import { conversationInclude } from "../../../lib/direct-conversation";
import type { AuthenticatedRequest } from "../../../middleware/require-auth";
import { prisma } from "../../../lib/prisma";
import {
  buildConversationSummary,
  countUnreadMessages,
} from "../serialize";

export async function listConversations(
  req: Request,
  res: Response,
): Promise<void> {
  const { sub: currentUserId } = (req as AuthenticatedRequest).sessionUser;

  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: { some: { userId: currentUserId } },
      },
      orderBy: { updatedAt: "desc" },
      include: conversationInclude,
    });

    const summaries = await Promise.all(
      conversations.map(async (conversation) => {
        const membership = conversation.participants.find(
          (p) => p.userId === currentUserId,
        );
        const unreadCount = await countUnreadMessages(
          conversation.id,
          currentUserId,
          membership?.lastReadAt ?? null,
        );
        return buildConversationSummary(
          conversation,
          currentUserId,
          unreadCount,
        );
      }),
    );

    res.json({ conversations: summaries });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load conversations" });
  }
}
