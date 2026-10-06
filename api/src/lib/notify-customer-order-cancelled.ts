import { notifyTeamExceptActor } from "./notify-team";

export async function notifyCustomerOrderCancelled(params: {
  orderCode: string;
  customerName: string;
  actorUserId: string;
  actorName: string;
}): Promise<void> {
  await notifyTeamExceptActor({
    actorUserId: params.actorUserId,
    type: "CUSTOMER_ORDER_CANCELLED",
    title: "Customer order cancelled",
    body: `${params.actorName} cancelled order ${params.orderCode} for ${params.customerName}. Stock was restored.`,
  });
}
