import { prisma } from "./prisma";

const PREVIEW_MAX = 140;

function messagePreview(body: string): string {
  const compact = body.replace(/\s+/g, " ").trim();
  if (compact.length <= PREVIEW_MAX) {
    return compact;
  }
  return `${compact.slice(0, PREVIEW_MAX - 1)}…`;
}

export async function notifyDirectMessage(params: {
  conversationId: string;
  actorUserId: string;
  actorName: string;
  body: string;
}): Promise<void> {
  const recipients = await prisma.conversationParticipant.findMany({
    where: {
      conversationId: params.conversationId,
      userId: { not: params.actorUserId },
    },
    select: { userId: true },
  });

  if (recipients.length === 0) {
    return;
  }

  const preview = messagePreview(params.body);

  await prisma.notification.createMany({
    data: recipients.map((participant) => ({
      userId: participant.userId,
      type: "DIRECT_MESSAGE",
      title: "New message",
      body: `${params.actorName}: ${preview}`,
      conversationId: params.conversationId,
    })),
  });
}
