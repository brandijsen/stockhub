import type { Request, Response } from "express";

import { notifyCustomerOrderUpdated } from "../../../lib/notify-customer-order-updated";
import { notifyLowStock } from "../../../lib/notify-low-stock";
import { prisma } from "../../../lib/prisma";
import { displayName } from "../../auth/session";
import type { AuthenticatedRequest } from "../../../middleware/require-auth";
import { CustomerOrderConflict, CustomerOrderRejected } from "../errors";
import { assertOpenCustomerOrder } from "../open-guard";
import { updateCustomerOrderSchema } from "../schemas";
import {
  customerOrderInclude,
  serializeCustomerOrder,
} from "../serialize";
import { validateCustomerOrderEditLines } from "../validate-lines";
import { applyOutboundDeltas, outboundDeltas } from "../stock-delta";

const ORDER_TRANSACTION = { maxWait: 10_000, timeout: 20_000 };

export async function updateCustomerOrder(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = req.params;
  const parsed = updateCustomerOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten(),
    });
    return;
  }

  const session = (req as AuthenticatedRequest).sessionUser;
  const { customerId, lines } = parsed.data;

  try {
    const existing = await prisma.customerOrder.findUnique({
      where: { id },
      select: {
        id: true,
        code: true,
        status: true,
        lines: { select: { articleId: true, quantity: true } },
      },
    });
    if (!existing) {
      res.status(404).json({ error: "Customer order not found" });
      return;
    }

    const openCheck = assertOpenCustomerOrder(existing.status);
    if (!openCheck.ok) {
      res.status(409).json({ error: openCheck.error });
      return;
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });
    if (!customer) {
      res.status(400).json({ error: "Customer not found" });
      return;
    }

    const lineCheck = await validateCustomerOrderEditLines(
      existing.lines,
      lines,
    );
    if (!lineCheck.ok) {
      res.status(400).json({ error: lineCheck.error });
      return;
    }

    const deltas = outboundDeltas(existing.lines, lines);

    const { order, lowStockArticles } = await prisma.$transaction(
      async (tx) => {
        const claimed = await tx.customerOrder.updateMany({
          where: { id, status: "OPEN" },
          data: { updatedAt: new Date() },
        });
        if (claimed.count !== 1) {
          throw new CustomerOrderConflict("Only open orders allow this action");
        }

        const lowStock = await applyOutboundDeltas(tx, {
          orderId: id,
          orderCode: existing.code,
          userId: session.sub,
          deltas,
        });

        await tx.customerOrderLine.deleteMany({
          where: { customerOrderId: id },
        });

        const updated = await tx.customerOrder.update({
          where: { id },
          data: {
            customerId,
            lines: {
              create: lines.map((line) => ({
                articleId: line.articleId,
                quantity: line.quantity,
              })),
            },
          },
          include: customerOrderInclude,
        });

        return { order: updated, lowStockArticles: lowStock };
      },
      ORDER_TRANSACTION,
    );

    const actor = await prisma.user.findUnique({
      where: { id: session.sub },
      select: { firstName: true, lastName: true },
    });
    const actorName = actor ? displayName(actor) : "A team member";

    await notifyCustomerOrderUpdated({
      customerOrderId: order.id,
      orderCode: order.code,
      customerName: order.customer.name,
      actorUserId: session.sub,
      actorName,
    });

    for (const article of lowStockArticles) {
      await notifyLowStock({
        articleId: article.id,
        articleCode: article.code,
        articleName: article.name,
        stock: article.stock,
        minThreshold: article.minThreshold,
        actorUserId: session.sub,
        actorName,
      });
    }

    res.json({ order: serializeCustomerOrder(order) });
  } catch (e) {
    if (e instanceof CustomerOrderRejected) {
      res.status(400).json({ error: e.message });
      return;
    }
    if (e instanceof CustomerOrderConflict) {
      res.status(409).json({ error: e.message });
      return;
    }
    console.error(e);
    res.status(500).json({ error: "Failed to update customer order" });
  }
}
