import type { SupplierOrderStatus } from "@prisma/client";

export function assertCheckedStatus(
  status: SupplierOrderStatus,
): { ok: true } | { ok: false; error: string } {
  if (status !== "CHECKED") {
    return {
      ok: false,
      error: "Only checked orders can be closed by an admin",
    };
  }
  return { ok: true };
}
