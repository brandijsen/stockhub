import { notifyTeamExceptActor } from "./notify-team";

export async function notifySupplierOrderClosed(params: {
  supplierOrderId: string;
  orderCode: string;
  supplierName: string;
  outcome: "SUCCEEDED" | "DONE";
  adminCloseNote?: string | null;
  actorUserId: string;
  actorName: string;
}): Promise<void> {
  const note = params.adminCloseNote?.trim()
    ? ` Note: ${params.adminCloseNote.trim()}`
    : "";
  const body =
    params.outcome === "SUCCEEDED"
      ? `${params.actorName} closed order ${params.orderCode} for ${params.supplierName} as succeeded. Received stock was loaded.`
      : `${params.actorName} closed order ${params.orderCode} for ${params.supplierName} with reported issues. Stock was not loaded.${note}`;

  await notifyTeamExceptActor({
    actorUserId: params.actorUserId,
    type: "SUPPLIER_ORDER_CLOSED",
    title: "Supplier order closed",
    body,
    supplierOrderId: params.supplierOrderId,
  });
}
