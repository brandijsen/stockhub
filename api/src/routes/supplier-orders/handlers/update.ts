import type { Request, Response } from "express";

import { prisma } from "../../../lib/prisma";
import { assertPendingOrderStatus } from "../pending-guard";
import { updateSupplierOrderSchema } from "../schemas";
import {
  serializeSupplierOrder,
  supplierOrderInclude,
} from "../serialize";
import {
  validateSupplierOrderLines,
} from "../validate-lines";

export async function updateSupplierOrder(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = req.params;
  const parsed = updateSupplierOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten(),
    });
    return;
  }

  const { supplierId, lines } = parsed.data;

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

    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
    });
    if (!supplier) {
      res.status(400).json({ error: "Supplier not found" });
      return;
    }

    const articleCheck = await validateSupplierOrderLines(lines);
    if (!articleCheck.ok) {
      res.status(400).json({ error: articleCheck.error });
      return;
    }

    const order = await prisma.$transaction(async (tx) => {
      await tx.supplierOrderLine.deleteMany({
        where: { supplierOrderId: id },
      });
      return tx.supplierOrder.update({
        where: { id },
        data: {
          supplierId,
          lines: {
            create: lines.map((line) => ({
              articleId: line.articleId,
              qtyOrdered: line.qtyOrdered,
            })),
          },
        },
        include: supplierOrderInclude,
      });
    });

    res.json({
      order: serializeSupplierOrder(order),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to update supplier order" });
  }
}
