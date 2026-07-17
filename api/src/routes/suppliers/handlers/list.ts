import type { Request, Response } from "express";

import { prisma } from "../../../lib/prisma";
import { serializeSupplier, supplierInclude } from "../serialize";

export async function listSuppliers(_req: Request, res: Response): Promise<void> {
  try {
    const suppliers = await prisma.supplier.findMany({
      include: supplierInclude,
      orderBy: { name: "asc" },
    });
    res.json({ suppliers: suppliers.map(serializeSupplier) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load suppliers" });
  }
}
