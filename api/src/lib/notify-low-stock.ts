import { notifyTeamExceptActor } from "./notify-team";

export function droppedBelowMinimum(
  previousStock: number,
  newStock: number,
  minThreshold: number,
): boolean {
  return previousStock >= minThreshold && newStock < minThreshold;
}

export async function notifyLowStock(params: {
  articleId: string;
  articleCode: string;
  articleName: string;
  stock: number;
  minThreshold: number;
  actorUserId: string;
  actorName: string;
}): Promise<void> {
  await notifyTeamExceptActor({
    actorUserId: params.actorUserId,
    type: "LOW_STOCK",
    title: "Low stock",
    body: `${params.actorName} brought ${params.articleCode} (${params.articleName}) below its minimum. Stock: ${params.stock}. Minimum: ${params.minThreshold}.`,
    articleId: params.articleId,
  });
}
