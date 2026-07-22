import type { Request, Response } from "express";

import { prisma } from "../../../lib/prisma";
import { serializeSupplierOrder, supplierOrderInclude } from "../serialize";

export async function getSupplierOrder(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = req.params;

  try {
    const order = await prisma.supplierOrder.findUnique({
      where: { id },
      include: supplierOrderInclude,
    });

    if (!order) {
      res.status(404).json({ error: "Supplier order not found" });
      return;
    }

    res.json({ order: serializeSupplierOrder(order) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load supplier order" });
  }
}
