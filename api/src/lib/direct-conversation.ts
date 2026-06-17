import { prisma } from "./prisma";

const conversationInclude = {
  participants: {
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          lastSeenAt: true,
        },
      },
    },
  },
  messages: {
    orderBy: { createdAt: "desc" as const },
    take: 1,
    select: {
      id: true,
      body: true,
      createdAt: true,
      senderId: true,
    },
  },
} as const;

export async function findDirectConversation(
  userAId: string,
  userBId: string,
) {
  const candidates = await prisma.conversation.findMany({
    where: {
      AND: [
        { participants: { some: { userId: userAId } } },
        { participants: { some: { userId: userBId } } },
      ],
    },
    include: conversationInclude,
  });

  return candidates.find((c) => c.participants.length === 2) ?? null;
}

export async function findOrCreateDirectConversation(
  userAId: string,
  userBId: string,
) {
  const existing = await findDirectConversation(userAId, userBId);
  if (existing) {
    return existing;
  }

  return prisma.conversation.create({
    data: {
      participants: {
        create: [{ userId: userAId }, { userId: userBId }],
      },
    },
    include: conversationInclude,
  });
}

export async function getConversationParticipant(
  conversationId: string,
  userId: string,
) {
  return prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId,
      },
    },
  });
}

export { conversationInclude };
