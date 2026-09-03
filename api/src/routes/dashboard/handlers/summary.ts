import type { Request, Response } from "express";

import { prisma } from "../../../lib/prisma";

export type DashboardSummary = {
  lowStockArticles: number;
  supplierOrdersPending: number;
  supplierOrdersChecking: number;
  supplierOrdersChecked: number;
  customerOrdersOpen: number;
};

export async function getDashboardSummary(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const [
      lowStockArticles,
      supplierOrdersPending,
      supplierOrdersChecking,
      supplierOrdersChecked,
      customerOrdersOpen,
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
    ]);

    const summary: DashboardSummary = {
      lowStockArticles,
      supplierOrdersPending,
      supplierOrdersChecking,
      supplierOrdersChecked,
      customerOrdersOpen,
    };

    res.json({ summary });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load dashboard summary" });
  }
}
