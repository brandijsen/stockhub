import type { Request, Response } from "express";

import { generateOrderCode } from "../../../lib/order-code";
import { prisma } from "../../../lib/prisma";
import type { AuthenticatedRequest } from "../../../middleware/require-auth";
import { createSupplierOrderSchema } from "../schemas";
import {
  serializeSupplierOrder,
  supplierOrderInclude,
} from "../serialize";
import {
  validateSupplierOrderLines,
} from "../validate-lines";

export async function createSupplierOrder(
  req: Request,
  res: Response,
): Promise<void> {
  const parsed = createSupplierOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten(),
    });
    return;
  }

  const session = (req as AuthenticatedRequest).sessionUser;
  const { supplierId, lines } = parsed.data;

  try {
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
      const code = await generateOrderCode(tx, "SO");
      return tx.supplierOrder.create({
        data: {
          code,
          status: "PENDING",
          supplierId,
          createdById: session.sub,
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

    res.status(201).json({
      order: serializeSupplierOrder(order),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create supplier order" });
  }
}
