import type { Request, Response } from "express";

import { sendSupplierOrderCreatedEmail } from "../../../lib/supplier-order-mail";
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

    const order = await prisma.supplierOrder.create({
      data: {
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

    const serialized = serializeSupplierOrder(order);

    const mailResult = await sendSupplierOrderCreatedEmail({
      supplierEmail: supplier.email,
      supplierName: supplier.name,
      orderId: order.id,
      lines: order.lines.map((line) => ({
        code: line.article.code,
        name: line.article.name,
        qtyOrdered: line.qtyOrdered,
      })),
    });

    res.status(201).json({
      order: serialized,
      supplierEmailSent: mailResult.ok,
      ...(mailResult.ok ? {} : { supplierEmailError: mailResult.message }),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create supplier order" });
  }
}
