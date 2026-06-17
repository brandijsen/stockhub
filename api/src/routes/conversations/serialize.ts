import { isUserOnline } from "../../lib/user-presence";
import { prisma } from "../../lib/prisma";

type MessageUserRow = {
  id: string;
  firstName: string;
  lastName: string;
  lastSeenAt: Date | null;
};

export function serializeMessageUser(user: MessageUserRow) {
  return {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`.trim(),
    online: isUserOnline(user.lastSeenAt),
  };
}

type MessageRow = {
  id: string;
  body: string;
  createdAt: Date;
  senderId: string;
  sender: MessageUserRow;
};

export function serializeMessage(message: MessageRow) {
  return {
    id: message.id,
    body: message.body,
    createdAt: message.createdAt.toISOString(),
    senderId: message.senderId,
    sender: serializeMessageUser(message.sender),
    isOwn: false as boolean,
  };
}

type ConversationSummaryRow = {
  id: string;
  updatedAt: Date;
  participants: Array<{
    userId: string;
    lastReadAt: Date | null;
    user: MessageUserRow;
  }>;
  messages: Array<{
    id: string;
    body: string;
    createdAt: Date;
    senderId: string;
  }>;
};

export function buildConversationSummary(
  conversation: ConversationSummaryRow,
  currentUserId: string,
  unreadCount: number,
) {
  const otherParticipant = conversation.participants.find(
    (p) => p.userId !== currentUserId,
  );
  const lastMessage = conversation.messages[0] ?? null;

  return {
    id: conversation.id,
    updatedAt: conversation.updatedAt.toISOString(),
    otherUser: otherParticipant
      ? serializeMessageUser(otherParticipant.user)
      : null,
    lastMessage: lastMessage
      ? {
          id: lastMessage.id,
          body: lastMessage.body,
          createdAt: lastMessage.createdAt.toISOString(),
          senderId: lastMessage.senderId,
        }
      : null,
    unreadCount,
  };
}

export async function countUnreadMessages(
  conversationId: string,
  currentUserId: string,
  lastReadAt: Date | null,
): Promise<number> {
  return prisma.message.count({
    where: {
      conversationId,
      senderId: { not: currentUserId },
      ...(lastReadAt
        ? { createdAt: { gt: lastReadAt } }
        : {}),
    },
  });
}
