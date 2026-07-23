import type { Request, Response } from "express";

import { prisma } from "../../../lib/prisma";
import {
  customerOrderInclude,
  serializeCustomerOrder,
} from "../serialize";

export async function confirmCustomerOrderPickup(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = req.params;

  try {
    const existing = await prisma.customerOrder.findUnique({
      where: { id },
    });
    if (!existing) {
      res.status(404).json({ error: "Customer order not found" });
      return;
    }

    if (existing.status !== "OPEN") {
      res.status(400).json({
        error: "Only open orders can be confirmed as picked up",
      });
      return;
    }

    const order = await prisma.customerOrder.update({
      where: { id },
      data: { status: "PICKED_UP" },
      include: customerOrderInclude,
    });

    res.json({ order: serializeCustomerOrder(order) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to confirm pickup" });
  }
}
