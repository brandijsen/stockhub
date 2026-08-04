import type { Request, Response } from "express";

import { prisma } from "../../../lib/prisma";
import type { AuthenticatedRequest } from "../../../middleware/require-auth";

export type DashboardSummary = {
  lowStockArticles: number;
  supplierOrdersPending: number;
  supplierOrdersChecking: number;
  supplierOrdersChecked: number;
  customerOrdersOpen: number;
  unreadNotifications: number;
};

export async function getDashboardSummary(
  req: Request,
  res: Response,
): Promise<void> {
  const session = (req as AuthenticatedRequest).sessionUser;

  try {
    const [
      lowStockArticles,
      supplierOrdersPending,
      supplierOrdersChecking,
      supplierOrdersChecked,
      customerOrdersOpen,
      unreadNotifications,
    ] = await Promise.all([
      prisma.article.count({
        where: {
          isActive: true,
          stock: { lt: prisma.article.fields.minThreshold },
        },
      }),
      prisma.supplierOrder.count({ where: { status: "PENDING" } }),
      prisma.supplierOrder.count({ where: { status: "ARRIVED_CHECKING" } }),
      prisma.supplierOrder.count({ where: { status: "CHECKED" } }),
      prisma.customerOrder.count({ where: { status: "OPEN" } }),
      prisma.notification.count({
        where: { userId: session.sub, readAt: null },
      }),
    ]);

    const summary: DashboardSummary = {
      lowStockArticles,
      supplierOrdersPending,
      supplierOrdersChecking,
      supplierOrdersChecked,
      customerOrdersOpen,
      unreadNotifications,
    };

    res.json({ summary });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load dashboard summary" });
  }
}
