import { beforeEach, describe, expect, it, vi } from "vitest";

const prisma = {
  user: {
    findMany: vi.fn(),
  },
  notification: {
    createMany: vi.fn(),
  },
};

vi.mock("../src/lib/prisma", () => ({ prisma }));

const { droppedBelowMinimum, notifyLowStock } = await import(
  "../src/lib/notify-low-stock"
);
const { notifyCustomerOrderCreated } = await import(
  "../src/lib/notify-customer-order-created"
);
const { notifyCustomerOrderPickedUp } = await import(
  "../src/lib/notify-customer-order-picked-up"
);
const { notifyCustomerOrderUpdated } = await import(
  "../src/lib/notify-customer-order-updated"
);
const { notifyCustomerOrderCancelled } = await import(
  "../src/lib/notify-customer-order-cancelled"
);
const { notifySupplierOrderClosed } = await import(
  "../src/lib/notify-supplier-order-closed"
);
const { notifySupplierOrderChecked } = await import(
  "../src/lib/notify-supplier-order-checked"
);

beforeEach(() => {
  vi.clearAllMocks();
  prisma.user.findMany.mockResolvedValue([{ id: "user2" }]);
  prisma.notification.createMany.mockResolvedValue({ count: 1 });
});

describe("droppedBelowMinimum", () => {
  it("is true only when stock crosses from the minimum to below it", () => {
    expect(droppedBelowMinimum(5, 4, 5)).toBe(true);
    expect(droppedBelowMinimum(4, 3, 5)).toBe(false);
    expect(droppedBelowMinimum(5, 5, 5)).toBe(false);
    expect(droppedBelowMinimum(1, 0, 0)).toBe(false);
  });
});

describe("team notifications", () => {
  it("does not notify the actor", async () => {
    prisma.user.findMany.mockResolvedValue([]);

    await notifyCustomerOrderCreated({
      customerOrderId: "order1",
      orderCode: "CO-000001",
      customerName: "Ada",
      actorUserId: "user1",
      actorName: "Ada Lovelace",
    });

    expect(prisma.user.findMany).toHaveBeenCalledWith({
      where: { id: { not: "user1" } },
      select: { id: true },
    });
    expect(prisma.notification.createMany).not.toHaveBeenCalled();
  });

  it("links a customer order and describes the unload", async () => {
    await notifyCustomerOrderCreated({
      customerOrderId: "order1",
      orderCode: "CO-000001",
      customerName: "Ada",
      actorUserId: "user1",
      actorName: "Ada Lovelace",
    });

    expect(prisma.notification.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          userId: "user2",
          type: "CUSTOMER_ORDER_CREATED",
          customerOrderId: "order1",
          body: "Ada Lovelace created order CO-000001 for Ada. Stock was unloaded.",
        }),
      ],
    });
  });

  it("links a picked-up customer order", async () => {
    await notifyCustomerOrderPickedUp({
      customerOrderId: "order1",
      orderCode: "CO-000001",
      customerName: "Ada",
      actorUserId: "user1",
      actorName: "Ada Lovelace",
    });

    expect(prisma.notification.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          userId: "user2",
          type: "CUSTOMER_ORDER_PICKED_UP",
          customerOrderId: "order1",
          title: "Customer order picked up",
          body: "Ada Lovelace confirmed pickup of order CO-000001 for Ada.",
        }),
      ],
    });
  });

  it("links an updated customer order", async () => {
    await notifyCustomerOrderUpdated({
      customerOrderId: "order1",
      orderCode: "CO-000001",
      customerName: "Ada",
      actorUserId: "user1",
      actorName: "Ada Lovelace",
    });

    expect(prisma.notification.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          userId: "user2",
          type: "CUSTOMER_ORDER_UPDATED",
          customerOrderId: "order1",
          title: "Customer order updated",
          body: "Ada Lovelace updated order CO-000001 for Ada. Stock was adjusted.",
        }),
      ],
    });
  });

  it("describes a cancelled customer order without linking it", async () => {
    await notifyCustomerOrderCancelled({
      orderCode: "CO-000001",
      customerName: "Ada",
      actorUserId: "user1",
      actorName: "Ada Lovelace",
    });

    expect(prisma.notification.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          userId: "user2",
          type: "CUSTOMER_ORDER_CANCELLED",
          title: "Customer order cancelled",
          body: "Ada Lovelace cancelled order CO-000001 for Ada. Stock was restored.",
        }),
      ],
    });
    const payload = prisma.notification.createMany.mock.calls[0][0] as {
      data: { customerOrderId?: string }[];
    };
    expect(payload.data[0].customerOrderId).toBeUndefined();
  });

  it("links a low-stock article", async () => {
    await notifyLowStock({
      articleId: "art1",
      articleCode: "BAG",
      articleName: "Bag",
      stock: 1,
      minThreshold: 2,
      actorUserId: "user1",
      actorName: "Ada Lovelace",
    });

    expect(prisma.notification.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          userId: "user2",
          type: "LOW_STOCK",
          articleId: "art1",
          body: "Ada Lovelace brought BAG (Bag) below its minimum. Stock: 1. Minimum: 2.",
        }),
      ],
    });
  });

  it("says whether a closed supplier order loaded stock", async () => {
    await notifySupplierOrderClosed({
      supplierOrderId: "so1",
      orderCode: "SO-000001",
      supplierName: "Acme",
      outcome: "SUCCEEDED",
      actorUserId: "user1",
      actorName: "Ada Lovelace",
    });
    await notifySupplierOrderClosed({
      supplierOrderId: "so1",
      orderCode: "SO-000001",
      supplierName: "Acme",
      outcome: "DONE",
      adminCloseNote: "Damaged goods",
      actorUserId: "user1",
      actorName: "Ada Lovelace",
    });

    const payloads = prisma.notification.createMany.mock.calls.map(
      (call) => call[0].data[0].body as string,
    );
    expect(payloads[0]).toBe(
      "Ada Lovelace closed order SO-000001 for Acme as succeeded. Received stock was loaded.",
    );
    expect(payloads[1]).toBe(
      "Ada Lovelace closed order SO-000001 for Acme with reported issues. Stock was not loaded. Note: Damaged goods",
    );
    expect(prisma.notification.createMany.mock.calls[0][0].data[0]).toEqual(
      expect.objectContaining({
        type: "SUPPLIER_ORDER_CLOSED",
        supplierOrderId: "so1",
      }),
    );
  });

  it("mentions non-conforming lines after goods checking", async () => {
    await notifySupplierOrderChecked({
      supplierOrderId: "so1",
      orderCode: "SO-000001",
      supplierName: "Acme",
      hasNonConformLine: true,
      actorUserId: "user1",
      actorName: "Ada Lovelace",
    });

    expect(prisma.notification.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          type: "SUPPLIER_ORDER_CHECKED",
          supplierOrderId: "so1",
          body: "Ada Lovelace finished checking order SO-000001 for Acme. One or more lines do not conform. An admin can close it.",
        }),
      ],
    });
  });
});
