import { prisma } from "./prisma";

export async function notifyTeamExceptActor(params: {
  actorUserId: string;
  type: string;
  title: string;
  body: string;
  articleId?: string;
  supplierOrderId?: string;
  customerOrderId?: string;
}): Promise<void> {
  const recipients = await prisma.user.findMany({
    where: { id: { not: params.actorUserId } },
    select: { id: true },
  });

  if (recipients.length === 0) {
    return;
  }

  await prisma.notification.createMany({
    data: recipients.map((user) => ({
      userId: user.id,
      type: params.type,
      title: params.title,
      body: params.body,
      ...(params.articleId ? { articleId: params.articleId } : {}),
      ...(params.supplierOrderId
        ? { supplierOrderId: params.supplierOrderId }
        : {}),
      ...(params.customerOrderId
        ? { customerOrderId: params.customerOrderId }
        : {}),
    })),
  });
}
