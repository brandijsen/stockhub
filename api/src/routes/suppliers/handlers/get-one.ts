import type { Request, Response } from "express";

import { prisma } from "../../../lib/prisma";
import { serializeSupplier, supplierInclude } from "../serialize";

export async function getSupplier(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: supplierInclude,
    });

    if (!supplier) {
      res.status(404).json({ error: "Supplier not found" });
      return;
    }

    res.json({ supplier: serializeSupplier(supplier) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load supplier" });
  }
}
