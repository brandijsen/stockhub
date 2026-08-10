import type { Request, Response } from "express";

import {
  sendSupplierOrderDoneEmail,
  sendSupplierOrderSucceededEmail,
} from "../../../lib/supplier-order-mail";
import { prisma } from "../../../lib/prisma";
import type { AuthenticatedRequest } from "../../../middleware/require-auth";
import { assertCheckedStatus } from "../checked-guard";
import { closeSupplierOrderSchema } from "../schemas";
import {
  serializeSupplierOrder,
  supplierOrderInclude,
} from "../serialize";

type CheckedLine = {
  code: string;
  name: string;
  qtyOrdered: number;
  qtyReceivedActual: number;
  lineConform: boolean;
};

function linesForCloseEmail(
  lines: Array<{
    qtyOrdered: number;
    qtyReceivedActual: number | null;
    lineConform: boolean | null;
    article: { code: string; name: string };
  }>,
): CheckedLine[] {
  return lines.map((line) => ({
    code: line.article.code,
    name: line.article.name,
    qtyOrdered: line.qtyOrdered,
    qtyReceivedActual: line.qtyReceivedActual ?? 0,
    lineConform: line.lineConform ?? false,
  }));
}

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

    const emailLines = linesForCloseEmail(order.lines);
    const mailResult =
      outcome === "SUCCEEDED"
        ? await sendSupplierOrderSucceededEmail({
            supplierEmail: order.supplier.email,
            supplierName: order.supplier.name,
            orderCode: order.code,
            lines: emailLines,
          })
        : await sendSupplierOrderDoneEmail({
            supplierEmail: order.supplier.email,
            supplierName: order.supplier.name,
            orderCode: order.code,
            lines: emailLines,
            adminCloseNote: adminCloseNote ?? "",
          });

    res.json({
      order: serializeSupplierOrder(order),
      supplierEmailSent: mailResult.ok,
      ...(mailResult.ok ? {} : { supplierEmailError: mailResult.message }),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to close supplier order" });
  }
}
