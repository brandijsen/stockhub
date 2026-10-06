import type { Request, Response } from "express";

import { notifySupplierOrderClosed } from "../../../lib/notify-supplier-order-closed";
import { prisma } from "../../../lib/prisma";
import { displayName } from "../../auth/session";
import type { AuthenticatedRequest } from "../../../middleware/require-auth";
import { assertCheckedStatus } from "../checked-guard";
import { closeSupplierOrderSchema } from "../schemas";
import {
  serializeSupplierOrder,
  supplierOrderInclude,
} from "../serialize";

function validateCheckingComplete(
  lines: Array<{
    qtyReceivedActual: number | null;
    lineConform: boolean | null;
  }>,
): { ok: true } | { ok: false; error: string } {
  for (const line of lines) {
    if (line.qtyReceivedActual == null || line.lineConform == null) {
      return {
        ok: false,
        error: "Checking data is incomplete; complete goods checking first",
      };
    }
  }
  return { ok: true };
}

export async function closeSupplierOrder(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = req.params;
  const parsed = closeSupplierOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten(),
    });
    return;
  }

  const session = (req as AuthenticatedRequest).sessionUser;
  const { outcome, adminCloseNote } = parsed.data;

  try {
    const existing = await prisma.supplierOrder.findUnique({
      where: { id },
      include: supplierOrderInclude,
    });
    if (!existing) {
      res.status(404).json({ error: "Supplier order not found" });
      return;
    }

    const checkedGuard = assertCheckedStatus(existing.status);
    if (!checkedGuard.ok) {
      res.status(409).json({ error: checkedGuard.error });
      return;
    }

    const checkingGuard = validateCheckingComplete(existing.lines);
    if (!checkingGuard.ok) {
      res.status(400).json({ error: checkingGuard.error });
      return;
    }

    const hasNonConformLine = existing.lines.some((line) => !line.lineConform);
    if (outcome === "SUCCEEDED" && hasNonConformLine) {
      res.status(400).json({
        error:
          "Cannot close as succeeded when one or more lines are not conforming; use done with issues instead",
      });
      return;
    }

    const closedAt = new Date();

    await prisma.$transaction(async (tx) => {
      if (outcome === "SUCCEEDED") {
        for (const line of existing.lines) {
          const qty = line.qtyReceivedActual ?? 0;
          if (qty <= 0) {
            continue;
          }
          await tx.article.update({
            where: { id: line.articleId },
            data: { stock: { increment: qty } },
          });
          await tx.movement.create({
            data: {
              type: "LOAD",
              delta: qty,
              articleId: line.articleId,
              userId: session.sub,
              relatedSupplierOrderId: existing.id,
              note: `Inbound from supplier order ${existing.id}`,
            },
          });
        }
      }

      await tx.supplierOrder.update({
        where: { id },
        data: {
          status: outcome,
          closedAt,
          closedById: session.sub,
          adminCloseNote: adminCloseNote ?? null,
        },
      });
    });

    const order = await prisma.supplierOrder.findUniqueOrThrow({
      where: { id },
      include: supplierOrderInclude,
    });

    const actor = await prisma.user.findUnique({
      where: { id: session.sub },
      select: { firstName: true, lastName: true },
    });
    const actorName = actor ? displayName(actor) : "A team member";

    await notifySupplierOrderClosed({
      supplierOrderId: order.id,
      orderCode: order.code,
      supplierName: order.supplier.name,
      outcome,
      adminCloseNote,
      actorUserId: session.sub,
      actorName,
    });

    res.json({
      order: serializeSupplierOrder(order),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to close supplier order" });
  }
}
