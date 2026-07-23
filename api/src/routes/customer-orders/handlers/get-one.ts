import type { Request, Response } from "express";

import { prisma } from "../../../lib/prisma";
import {
  customerOrderInclude,
  serializeCustomerOrder,
} from "../serialize";

export async function getCustomerOrder(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = req.params;

  try {
    const order = await prisma.customerOrder.findUnique({
      where: { id },
      include: customerOrderInclude,
    });

    if (!order) {
      res.status(404).json({ error: "Customer order not found" });
      return;
    }

    res.json({ order: serializeCustomerOrder(order) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load customer order" });
  }
}
