import type { Request, Response } from "express";

import { prisma } from "../../../lib/prisma";
import { updateCustomerSchema } from "../schemas";
import { serializeCustomer, customerInclude } from "../serialize";

export async function updateCustomer(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = req.params;
  const parsed = updateCustomerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten(),
    });
    return;
  }

  try {
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: parsed.data,
      include: customerInclude,
    });
    res.json({ customer: serializeCustomer(customer) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to update customer" });
  }
}
