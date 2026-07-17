import type { Request, Response } from "express";

import { isPrismaForeignKeyViolation } from "../../../lib/prisma-errors";
import { prisma } from "../../../lib/prisma";

export async function deleteSupplier(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = req.params;

  try {
    const existing = await prisma.supplier.findUnique({
      where: { id },
      include: { _count: { select: { orders: true } } },
    });
    if (!existing) {
      res.status(404).json({ error: "Supplier not found" });
      return;
    }

    if (existing._count.orders > 0) {
      res.status(409).json({
        error: "Supplier has purchase orders and cannot be deleted",
      });
      return;
    }

    await prisma.supplier.delete({ where: { id } });
    res.json({ ok: true });
  } catch (e) {
    if (isPrismaForeignKeyViolation(e)) {
      res.status(409).json({
        error: "Supplier has purchase orders and cannot be deleted",
      });
      return;
    }
    console.error(e);
    res.status(500).json({ error: "Failed to delete supplier" });
  }
}
