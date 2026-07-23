import type { Request, Response } from "express";

import { prisma } from "../../../lib/prisma";
import { createCustomerSchema } from "../schemas";
import { serializeCustomer, customerInclude } from "../serialize";

export async function createCustomer(
  req: Request,
  res: Response,
): Promise<void> {
  const parsed = createCustomerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten(),
    });
    return;
  }

  try {
    const customer = await prisma.customer.create({
      data: parsed.data,
      include: customerInclude,
    });
    res.status(201).json({ customer: serializeCustomer(customer) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create customer" });
  }
}
