import type { Request, Response } from "express";

import { prisma } from "../../../lib/prisma";
import { serializeCustomer, customerInclude } from "../serialize";

export async function getCustomer(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: customerInclude,
    });

    if (!customer) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }

    res.json({ customer: serializeCustomer(customer) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load customer" });
  }
}
