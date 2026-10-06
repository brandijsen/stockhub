import { notifyTeamExceptActor } from "./notify-team";

export async function notifyCustomerOrderCreated(params: {
  customerOrderId: string;
  orderCode: string;
  customerName: string;
  actorUserId: string;
  actorName: string;
}): Promise<void> {
  await notifyTeamExceptActor({
    actorUserId: params.actorUserId,
    type: "CUSTOMER_ORDER_CREATED",
    title: "Customer order created",
    body: `${params.actorName} created order ${params.orderCode} for ${params.customerName}. Stock was unloaded.`,
    customerOrderId: params.customerOrderId,
  });
}
