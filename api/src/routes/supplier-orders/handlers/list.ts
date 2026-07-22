import type { Request, Response } from "express";

import { prisma } from "../../../lib/prisma";
import { listSupplierOrdersQuerySchema } from "../schemas";
import {
  serializeSupplierOrder,
  supplierOrderInclude,
} from "../serialize";

export async function listSupplierOrders(
  req: Request,
  res: Response,
): Promise<void> {
  const parsed = listSupplierOrdersQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten(),
    });
    return;
  }

  const { page, limit, status } = parsed.data;
  const skip = (page - 1) * limit;
  const where = status ? { status } : {};

  try {
    const [orders, total] = await Promise.all([
      prisma.supplierOrder.findMany({
        where,
        include: supplierOrderInclude,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.supplierOrder.count({ where }),
    ]);

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    res.json({
      orders: orders.map(serializeSupplierOrder),
      total,
      page,
      limit,
      totalPages,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load supplier orders" });
  }
}
