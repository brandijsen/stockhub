import type { Request, Response } from "express";

import { getConversationParticipant } from "../../../lib/direct-conversation";
import type { AuthenticatedRequest } from "../../../middleware/require-auth";
import { prisma } from "../../../lib/prisma";
import { listMessagesQuerySchema, sendMessageSchema } from "../schemas";
import { serializeMessage } from "../serialize";

export async function listMessages(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = req.params;
  const { sub: currentUserId } = (req as AuthenticatedRequest).sessionUser;
  const parsed = listMessagesQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten(),
    });
    return;
  }

  const { cursor, limit } = parsed.data;

  try {
    const membership = await getConversationParticipant(id, currentUserId);
    if (!membership) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }

    const cursorMessage = cursor
      ? await prisma.message.findFirst({
          where: { id: cursor, conversationId: id },
          select: { createdAt: true },
        })
      : null;

    if (cursor && !cursorMessage) {
      res.status(400).json({ error: "Invalid cursor" });
      return;
    }

    const rows = await prisma.message.findMany({
      where: {
        conversationId: id,
        ...(cursorMessage
          ? { createdAt: { lt: cursorMessage.createdAt } }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            lastSeenAt: true,
          },
        },
      },
    });

    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? page[page.length - 1]?.id ?? null : null;

    const messages = page
      .reverse()
      .map((message) => ({
        ...serializeMessage(message),
        isOwn: message.senderId === currentUserId,
      }));

    res.json({ messages, nextCursor });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load messages" });
  }
}

export async function sendMessage(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = req.params;
  const { sub: currentUserId } = (req as AuthenticatedRequest).sessionUser;
  const parsed = sendMessageSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten(),
    });
    return;
  }

  try {
    const membership = await getConversationParticipant(id, currentUserId);
    if (!membership) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }

    const message = await prisma.$transaction(async (tx) => {
      const created = await tx.message.create({
        data: {
          conversationId: id,
          senderId: currentUserId,
          body: parsed.data.body,
        },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              lastSeenAt: true,
            },
          },
        },
      });

      await tx.conversation.update({
        where: { id },
        data: { updatedAt: new Date() },
      });

      return created;
    });

    res.status(201).json({
      message: {
        ...serializeMessage(message),
        isOwn: true,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to send message" });
  }
}
