import { notifyTeamExceptActor } from "./notify-team";

export async function notifySupplierOrderChecked(params: {
  supplierOrderId: string;
  orderCode: string;
  supplierName: string;
  hasNonConformLine: boolean;
  actorUserId: string;
  actorName: string;
}): Promise<void> {
  const conformity = params.hasNonConformLine
    ? "One or more lines do not conform. "
    : "";

  await notifyTeamExceptActor({
    actorUserId: params.actorUserId,
    type: "SUPPLIER_ORDER_CHECKED",
    title: "Goods checking complete",
    body: `${params.actorName} finished checking order ${params.orderCode} for ${params.supplierName}. ${conformity}An admin can close it.`,
    supplierOrderId: params.supplierOrderId,
  });
}
