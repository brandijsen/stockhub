import type { CustomerOrderStatus } from "@prisma/client";

export function assertOpenCustomerOrder(
  status: CustomerOrderStatus,
): { ok: true } | { ok: false; error: string } {
  if (status !== "OPEN") {
    return {
      ok: false,
      error: "Only open orders allow this action",
    };
  }
  return { ok: true };
}
