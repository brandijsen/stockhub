import { notifyTeamExceptActor } from "./notify-team";

export async function notifyCustomerOrderUpdated(params: {
  customerOrderId: string;
  orderCode: string;
  customerName: string;
  actorUserId: string;
  actorName: string;
}): Promise<void> {
  await notifyTeamExceptActor({
    actorUserId: params.actorUserId,
    type: "CUSTOMER_ORDER_UPDATED",
    title: "Customer order updated",
    body: `${params.actorName} updated order ${params.orderCode} for ${params.customerName}. Stock was adjusted.`,
    customerOrderId: params.customerOrderId,
  });
}
