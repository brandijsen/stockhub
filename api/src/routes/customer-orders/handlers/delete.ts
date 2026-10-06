import type { Request, Response } from "express";

import { prisma } from "../../../lib/prisma";
import type { AuthenticatedRequest } from "../../../middleware/require-auth";
import { CustomerOrderConflict, CustomerOrderRejected } from "../errors";
import { assertOpenCustomerOrder } from "../open-guard";
import { applyOutboundDeltas, outboundDeltas } from "../stock-delta";

const ORDER_TRANSACTION = { maxWait: 10_000, timeout: 20_000 };

export async function deleteCustomerOrder(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = req.params;
  const session = (req as AuthenticatedRequest).sessionUser;

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

    await prisma.$transaction(async (tx) => {
      const claimed = await tx.customerOrder.updateMany({
        where: { id, status: "OPEN" },
        data: { updatedAt: new Date() },
      });
      if (claimed.count !== 1) {
        throw new CustomerOrderConflict("Only open orders allow this action");
      }

      await applyOutboundDeltas(tx, {
        orderId: id,
        orderCode: existing.code,
        userId: session.sub,
        deltas: outboundDeltas(existing.lines, []),
      });

      await tx.customerOrder.delete({ where: { id } });
    }, ORDER_TRANSACTION);

    res.json({ ok: true });
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
    res.status(500).json({ error: "Failed to delete customer order" });
  }
}
