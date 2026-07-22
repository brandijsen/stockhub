import type { SupplierOrderStatus } from "@prisma/client";

export function assertPendingOrderStatus(
  status: SupplierOrderStatus,
): { ok: true } | { ok: false; error: string } {
  if (status !== "PENDING") {
    return {
      ok: false,
      error: "Only pending orders allow this action",
    };
  }
  return { ok: true };
}
