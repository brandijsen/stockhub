import type { Request, Response } from "express";

import { prisma } from "../../../lib/prisma";
import { createSupplierSchema } from "../schemas";
import { serializeSupplier, supplierInclude } from "../serialize";

export async function createSupplier(
  req: Request,
  res: Response,
): Promise<void> {
  const parsed = createSupplierSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten(),
    });
    return;
  }

  try {
    const supplier = await prisma.supplier.create({
      data: parsed.data,
      include: supplierInclude,
    });
    res.status(201).json({ supplier: serializeSupplier(supplier) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create supplier" });
  }
}
