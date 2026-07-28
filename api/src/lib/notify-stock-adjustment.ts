import { prisma } from "./prisma";

export async function notifyStockAdjustment(params: {
  articleId: string;
  articleCode: string;
  articleName: string;
  delta: number;
  newStock: number;
  actorUserId: string;
  actorName: string;
  note?: string | null;
}): Promise<void> {
  const recipients = await prisma.user.findMany({
    where: { id: { not: params.actorUserId } },
    select: { id: true },
  });

  if (recipients.length === 0) {
    return;
  }

  const direction = params.delta > 0 ? "increased" : "decreased";
  const amount = Math.abs(params.delta);
  const noteSuffix = params.note?.trim()
    ? ` Note: ${params.note.trim()}`
    : "";

  await prisma.notification.createMany({
    data: recipients.map((user) => ({
      userId: user.id,
      type: "STOCK_ADJUSTMENT",
      title: "Stock adjustment",
      body: `${params.actorName} ${direction} stock for ${params.articleCode} (${params.articleName}) by ${amount}. New stock: ${params.newStock}.${noteSuffix}`,
      articleId: params.articleId,
    })),
  });
}
