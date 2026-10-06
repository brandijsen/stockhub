import type { Request, Response } from "express";

import { notifyCustomerOrderCreated } from "../../../lib/notify-customer-order-created";
import {
  droppedBelowMinimum,
  notifyLowStock,
} from "../../../lib/notify-low-stock";
import { generateOrderCode } from "../../../lib/order-code";
import { prisma } from "../../../lib/prisma";
import { displayName } from "../../auth/session";
import type { AuthenticatedRequest } from "../../../middleware/require-auth";
import { createCustomerOrderSchema } from "../schemas";
import {
  customerOrderInclude,
  serializeCustomerOrder,
} from "../serialize";
import { validateCustomerOrderLines } from "../validate-lines";

class CustomerOrderRejected extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CustomerOrderRejected";
  }
}

export async function createCustomerOrder(
  req: Request,
  res: Response,
): Promise<void> {
  const parsed = createCustomerOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten(),
    });
    return;
  }

  const session = (req as AuthenticatedRequest).sessionUser;
  const { customerId, lines } = parsed.data;

  try {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });
    if (!customer) {
      res.status(400).json({ error: "Customer not found" });
      return;
    }

    const lineCheck = await validateCustomerOrderLines(lines);
    if (!lineCheck.ok) {
      res.status(400).json({ error: lineCheck.error });
      return;
    }

    const lowStockArticles: {
      id: string;
      code: string;
      name: string;
      stock: number;
      minThreshold: number;
    }[] = [];

    const order = await prisma.$transaction(async (tx) => {
      const code = await generateOrderCode(tx, "CO");
      const created = await tx.customerOrder.create({
        data: {
          code,
          status: "OPEN",
          customerId,
          createdById: session.sub,
          lines: {
            create: lines.map((line) => ({
              articleId: line.articleId,
              quantity: line.quantity,
            })),
          },
        },
        include: customerOrderInclude,
      });

      for (const line of lines) {
        const updated = await tx.article.updateMany({
          where: {
            id: line.articleId,
            stock: { gte: line.quantity },
          },
          data: { stock: { decrement: line.quantity } },
        });
        if (updated.count !== 1) {
          const article = await tx.article.findUnique({
            where: { id: line.articleId },
            select: { code: true, stock: true },
          });
          if (!article) {
            throw new CustomerOrderRejected(
              "One or more articles were not found",
            );
          }
          throw new CustomerOrderRejected(
            `Insufficient stock for ${article.code} (available ${article.stock}, requested ${line.quantity})`,
          );
        }
        await tx.movement.create({
          data: {
            type: "UNLOAD",
            delta: -line.quantity,
            articleId: line.articleId,
            userId: session.sub,
            relatedCustomerOrderId: created.id,
            note: `Outbound for customer order ${code}`,
          },
        });

        const updatedArticle = await tx.article.findUnique({
          where: { id: line.articleId },
          select: {
            id: true,
            code: true,
            name: true,
            stock: true,
            minThreshold: true,
          },
        });
        if (
          updatedArticle &&
          droppedBelowMinimum(
            updatedArticle.stock + line.quantity,
            updatedArticle.stock,
            updatedArticle.minThreshold,
          )
        ) {
          lowStockArticles.push(updatedArticle);
        }
      }

      return tx.customerOrder.findUniqueOrThrow({
        where: { id: created.id },
        include: customerOrderInclude,
      });
    }, { maxWait: 10_000, timeout: 20_000 });

    const actor = await prisma.user.findUnique({
      where: { id: session.sub },
      select: { firstName: true, lastName: true },
    });
    const actorName = actor ? displayName(actor) : "A team member";

    await notifyCustomerOrderCreated({
      customerOrderId: order.id,
      orderCode: order.code,
      customerName: order.customer.name,
      actorUserId: session.sub,
      actorName,
    });

    for (const article of lowStockArticles) {
      await notifyLowStock({
        articleId: article.id,
        articleCode: article.code,
        articleName: article.name,
        stock: article.stock,
        minThreshold: article.minThreshold,
        actorUserId: session.sub,
        actorName,
      });
    }

    res.status(201).json({ order: serializeCustomerOrder(order) });
  } catch (e) {
    if (e instanceof CustomerOrderRejected) {
      res.status(400).json({ error: e.message });
      return;
    }
    console.error(e);
    res.status(500).json({ error: "Failed to create customer order" });
  }
}
