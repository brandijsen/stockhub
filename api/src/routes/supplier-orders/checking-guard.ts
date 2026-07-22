import type { SupplierOrderStatus } from "@prisma/client";

export function assertArrivedCheckingStatus(
  status: SupplierOrderStatus,
): { ok: true } | { ok: false; error: string } {
  if (status !== "ARRIVED_CHECKING") {
    return {
      ok: false,
      error: "Only orders awaiting checking can be completed",
    };
  }
  return { ok: true };
}
