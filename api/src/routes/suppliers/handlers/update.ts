import type { Request, Response } from "express";

import { prisma } from "../../../lib/prisma";
import { updateSupplierSchema } from "../schemas";
import { serializeSupplier, supplierInclude } from "../serialize";

export async function updateSupplier(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = req.params;
  const parsed = updateSupplierSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten(),
    });
    return;
  }

  try {
    const existing = await prisma.supplier.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: "Supplier not found" });
      return;
    }

    const supplier = await prisma.supplier.update({
      where: { id },
      data: parsed.data,
      include: supplierInclude,
    });
    res.json({ supplier: serializeSupplier(supplier) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to update supplier" });
  }
}
