import type { Request, Response } from "express";

import { prisma } from "../../../lib/prisma";
import { assertPendingOrderStatus } from "../pending-guard";

export async function deleteSupplierOrder(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = req.params;

  try {
    const existing = await prisma.supplierOrder.findUnique({
      where: { id },
      select: { id: true, status: true },
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

    await prisma.supplierOrder.delete({ where: { id } });

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to delete supplier order" });
  }
}
