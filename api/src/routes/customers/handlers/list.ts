import type { Request, Response } from "express";

import { prisma } from "../../../lib/prisma";
import { serializeCustomer, customerInclude } from "../serialize";

export async function listCustomers(_req: Request, res: Response): Promise<void> {
  try {
    const customers = await prisma.customer.findMany({
      include: customerInclude,
      orderBy: { name: "asc" },
    });
    res.json({ customers: customers.map(serializeCustomer) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load customers" });
  }
}
