import type { Request, Response } from "express";

import { notifySupplierOrderChecked } from "../../../lib/notify-supplier-order-checked";
import { prisma } from "../../../lib/prisma";
import { displayName } from "../../auth/session";
import type { AuthenticatedRequest } from "../../../middleware/require-auth";
import { assertArrivedCheckingStatus } from "../checking-guard";
import { completeCheckingSchema } from "../schemas";
import {
  serializeSupplierOrder,
  supplierOrderInclude,
} from "../serialize";

export async function completeSupplierOrderChecking(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = req.params;
  const session = (req as AuthenticatedRequest).sessionUser;
  const parsed = completeCheckingSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten(),
    });
    return;
  }

  try {
    const existing = await prisma.supplierOrder.findUnique({
      where: { id },
      include: { lines: { select: { id: true } } },
    });
    if (!existing) {
      res.status(404).json({ error: "Supplier order not found" });
      return;
    }

    const checkingCheck = assertArrivedCheckingStatus(existing.status);
    if (!checkingCheck.ok) {
      res.status(409).json({ error: checkingCheck.error });
      return;
    }

    const expectedLineIds = new Set(existing.lines.map((line) => line.id));
    const submittedLineIds = parsed.data.lines.map((line) => line.lineId);

    if (submittedLineIds.length !== expectedLineIds.size) {
      res.status(400).json({
        error: "Checking must include every order line exactly once",
      });
      return;
    }

    for (const lineId of submittedLineIds) {
      if (!expectedLineIds.has(lineId)) {
        res.status(400).json({ error: "Unknown order line in checking payload" });
        return;
      }
    }

    const checkedAt = new Date();

    const order = await prisma.$transaction(async (tx) => {
      for (const line of parsed.data.lines) {
        await tx.supplierOrderLine.update({
          where: { id: line.lineId },
          data: {
            qtyReceivedActual: line.qtyReceivedActual,
            lineConform: line.lineConform,
          },
        });
      }

      return tx.supplierOrder.update({
        where: { id },
        data: {
          status: "CHECKED",
          checkedAt,
        },
        include: supplierOrderInclude,
      });
    });

    const actor = await prisma.user.findUnique({
      where: { id: session.sub },
      select: { firstName: true, lastName: true },
    });
    const actorName = actor ? displayName(actor) : "A team member";

    await notifySupplierOrderChecked({
      supplierOrderId: order.id,
      orderCode: order.code,
      supplierName: order.supplier.name,
      hasNonConformLine: parsed.data.lines.some((line) => !line.lineConform),
      actorUserId: session.sub,
      actorName,
    });

    res.json({ order: serializeSupplierOrder(order) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to complete goods checking" });
  }
}
