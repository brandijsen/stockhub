import type { Request, Response } from "express";

import { sendSupplierOrderCancelledEmail } from "../../../lib/supplier-order-mail";
import { prisma } from "../../../lib/prisma";
import { assertPendingOrderStatus } from "../pending-guard";
import { supplierOrderInclude } from "../serialize";

export async function deleteSupplierOrder(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = req.params;

  try {
    const existing = await prisma.supplierOrder.findUnique({
      where: { id },
      include: supplierOrderInclude,
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

    const mailResult = await sendSupplierOrderCancelledEmail({
      supplierEmail: existing.supplier.email,
      supplierName: existing.supplier.name,
      orderCode: existing.code,
      lines: existing.lines.map((line) => ({
        code: line.article.code,
        name: line.article.name,
        qtyOrdered: line.qtyOrdered,
      })),
    });

    await prisma.supplierOrder.delete({ where: { id } });

    res.json({
      ok: true,
      supplierEmailSent: mailResult.ok,
      ...(mailResult.ok ? {} : { supplierEmailError: mailResult.message }),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to delete supplier order" });
  }
}
