import { notifyTeamExceptActor } from "./notify-team";

export async function notifyCustomerOrderPickedUp(params: {
  customerOrderId: string;
  orderCode: string;
  customerName: string;
  actorUserId: string;
  actorName: string;
}): Promise<void> {
  await notifyTeamExceptActor({
    actorUserId: params.actorUserId,
    type: "CUSTOMER_ORDER_PICKED_UP",
    title: "Customer order picked up",
    body: `${params.actorName} confirmed pickup of order ${params.orderCode} for ${params.customerName}.`,
    customerOrderId: params.customerOrderId,
  });
}
