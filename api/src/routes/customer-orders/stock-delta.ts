import type { Prisma } from "@prisma/client";

import { droppedBelowMinimum } from "../../lib/notify-low-stock";
import { CustomerOrderRejected } from "./errors";

export type OutboundDelta = {
  articleId: string;
  outboundDelta: number;
};

export type LowStockHit = {
  id: string;
  code: string;
  name: string;
  stock: number;
  minThreshold: number;
};

export function outboundDeltas(
  previous: { articleId: string; quantity: number }[],
  next: { articleId: string; quantity: number }[],
): OutboundDelta[] {
  const totals = new Map<string, number>();
  for (const line of previous) {
    totals.set(line.articleId, (totals.get(line.articleId) ?? 0) - line.quantity);
  }
  for (const line of next) {
    totals.set(line.articleId, (totals.get(line.articleId) ?? 0) + line.quantity);
  }

  return [...totals.entries()]
    .filter(([, outboundDelta]) => outboundDelta !== 0)
    .map(([articleId, outboundDelta]) => ({ articleId, outboundDelta }));
}

export async function applyOutboundDeltas(
  tx: Prisma.TransactionClient,
  params: {
    orderId: string;
    orderCode: string;
    userId: string;
    deltas: OutboundDelta[];
  },
): Promise<LowStockHit[]> {
  const lowStock: LowStockHit[] = [];
  const returns = params.deltas.filter((delta) => delta.outboundDelta < 0);
  const unloads = params.deltas.filter((delta) => delta.outboundDelta > 0);

  for (const delta of returns) {
    const quantity = -delta.outboundDelta;
    await tx.article.update({
      where: { id: delta.articleId },
      data: { stock: { increment: quantity } },
    });
    await tx.movement.create({
      data: {
        type: "LOAD",
        delta: quantity,
        articleId: delta.articleId,
        userId: params.userId,
        relatedCustomerOrderId: params.orderId,
        note: `Returned stock for customer order ${params.orderCode}`,
      },
    });
  }

  for (const delta of unloads) {
    const updated = await tx.article.updateMany({
      where: {
        id: delta.articleId,
        stock: { gte: delta.outboundDelta },
      },
      data: { stock: { decrement: delta.outboundDelta } },
    });
    if (updated.count !== 1) {
      const article = await tx.article.findUnique({
        where: { id: delta.articleId },
        select: { code: true, stock: true },
      });
      if (!article) {
        throw new CustomerOrderRejected("One or more articles were not found");
      }
      throw new CustomerOrderRejected(
        `Insufficient stock for ${article.code} (available ${article.stock}, requested ${delta.outboundDelta})`,
      );
    }

    await tx.movement.create({
      data: {
        type: "UNLOAD",
        delta: -delta.outboundDelta,
        articleId: delta.articleId,
        userId: params.userId,
        relatedCustomerOrderId: params.orderId,
        note: `Adjusted outbound for customer order ${params.orderCode}`,
      },
    });

    const updatedArticle = await tx.article.findUnique({
      where: { id: delta.articleId },
      select: {
        id: true,
        code: true,
        name: true,
        stock: true,
        minThreshold: true,
      },
    });
    if (
      updatedArticle &&
      droppedBelowMinimum(
        updatedArticle.stock + delta.outboundDelta,
        updatedArticle.stock,
        updatedArticle.minThreshold,
      )
    ) {
      lowStock.push(updatedArticle);
    }
  }

  return lowStock;
}
