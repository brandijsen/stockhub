import type { Request, Response } from "express";

import { notifySupplierOrderArrived } from "../../../lib/notify-supplier-order-arrived";
import { prisma } from "../../../lib/prisma";
import type { AuthenticatedRequest } from "../../../middleware/require-auth";
import { assertPendingOrderStatus } from "../pending-guard";
import {
  serializeSupplierOrder,
  supplierOrderInclude,
} from "../serialize";

export async function declareSupplierOrderArrived(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = req.params;
  const session = (req as AuthenticatedRequest).sessionUser;

  try {
    const existing = await prisma.supplierOrder.findUnique({
      where: { id },
      include: {
        supplier: { select: { name: true } },
      },
    });
    if (!existing) {
      res.status(404).json({ error: "Supplier order not found" });
      return;
    }

    const pendingCheck = assertPendingOrderStatus(existing.status);
    if (!pendingCheck.ok) {
      res.status(409).json({ error: pendingCheck.error });
      return;
    }

    const actor = await prisma.user.findUnique({
      where: { id: session.sub },
      select: { firstName: true, lastName: true },
    });
    const actorName = actor
      ? `${actor.firstName} ${actor.lastName}`.trim()
      : "A team member";

    const order = await prisma.supplierOrder.update({
      where: { id },
      data: { status: "ARRIVED_CHECKING" },
      include: supplierOrderInclude,
    });

    await notifySupplierOrderArrived({
      supplierOrderId: order.id,
      supplierName: existing.supplier.name,
      actorUserId: session.sub,
      actorName,
    });

    res.json({ order: serializeSupplierOrder(order) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to declare supplier order arrived" });
  }
}
