import type { Request, Response } from "express";

import { prisma } from "../../../lib/prisma";
import { listCustomerOrdersQuerySchema } from "../schemas";
import {
  customerOrderInclude,
  serializeCustomerOrder,
} from "../serialize";

export async function listCustomerOrders(
  req: Request,
  res: Response,
): Promise<void> {
  const parsed = listCustomerOrdersQuerySchema.safeParse(req.query);
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
      prisma.customerOrder.findMany({
        where,
        include: customerOrderInclude,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.customerOrder.count({ where }),
    ]);

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    res.json({
      orders: orders.map(serializeCustomerOrder),
      total,
      page,
      limit,
      totalPages,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load customer orders" });
  }
}
