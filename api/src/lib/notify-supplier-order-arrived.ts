import { prisma } from "./prisma";

export async function notifySupplierOrderArrived(params: {
  supplierOrderId: string;
  supplierName: string;
  actorUserId: string;
  actorName: string;
}): Promise<void> {
  const recipients = await prisma.user.findMany({
    where: { id: { not: params.actorUserId } },
    select: { id: true },
  });

  if (recipients.length === 0) {
    return;
  }

  await prisma.notification.createMany({
    data: recipients.map((user) => ({
      userId: user.id,
      type: "SUPPLIER_ORDER_ARRIVED",
      title: "Supplier order arrived",
      body: `${params.actorName} marked the order for ${params.supplierName} as arrived. Goods checking can begin.`,
      supplierOrderId: params.supplierOrderId,
    })),
  });
}
