import type { Prisma } from "@prisma/client";

export type OrderCodePrefix = "SO" | "CO";

const CODE_WIDTH = 6;

function formatOrderCode(prefix: OrderCodePrefix, sequence: number): string {
  return `${prefix}-${String(sequence).padStart(CODE_WIDTH, "0")}`;
}

function parseSequence(prefix: OrderCodePrefix, code: string): number | null {
  const expectedPrefix = `${prefix}-`;
  if (!code.startsWith(expectedPrefix)) {
    return null;
  }
  const parsed = Number.parseInt(code.slice(expectedPrefix.length), 10);
  return Number.isNaN(parsed) ? null : parsed;
}

async function maxSequenceForPrefix(
  tx: Prisma.TransactionClient,
  prefix: OrderCodePrefix,
): Promise<number> {
  if (prefix === "SO") {
    const orders = await tx.supplierOrder.findMany({
      select: { code: true },
    });
    return orders.reduce((max, order) => {
      const sequence = parseSequence(prefix, order.code);
      return sequence != null && sequence > max ? sequence : max;
    }, 0);
  }

  const orders = await tx.customerOrder.findMany({
    select: { code: true },
  });
  return orders.reduce((max, order) => {
    const sequence = parseSequence(prefix, order.code);
    return sequence != null && sequence > max ? sequence : max;
  }, 0);
}

export async function generateOrderCode(
  tx: Prisma.TransactionClient,
  prefix: OrderCodePrefix,
): Promise<string> {
  const nextSequence = (await maxSequenceForPrefix(tx, prefix)) + 1;
  return formatOrderCode(prefix, nextSequence);
}
