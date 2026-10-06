import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { prismaMock } from "./prisma-mock";
import { mockResponse } from "./mock-response";

vi.mock("../src/lib/prisma", () => ({
  prisma: prismaMock,
}));

vi.mock("../src/lib/notify-stock-adjustment", () => ({
  notifyStockAdjustment: vi.fn(),
}));

vi.mock("../src/lib/notify-customer-order-created", () => ({
  notifyCustomerOrderCreated: vi.fn(),
}));

vi.mock("../src/lib/notify-low-stock", async () => {
  const actual = await vi.importActual<
    typeof import("../src/lib/notify-low-stock")
  >("../src/lib/notify-low-stock");
  return {
    ...actual,
    notifyLowStock: vi.fn(),
  };
});

vi.mock("../src/lib/notify-supplier-order-closed", () => ({
  notifySupplierOrderClosed: vi.fn(),
}));

vi.mock("../src/lib/notify-supplier-order-checked", () => ({
  notifySupplierOrderChecked: vi.fn(),
}));

const { createCustomerOrder } = await import(
  "../src/routes/customer-orders/handlers/create"
);
const { adjustArticleStock } = await import(
  "../src/routes/articles/handlers/adjust-stock"
);
const { closeSupplierOrder } = await import(
  "../src/routes/supplier-orders/handlers/close"
);
const { completeSupplierOrderChecking } = await import(
  "../src/routes/supplier-orders/handlers/complete-checking"
);
const { notifyCustomerOrderCreated } = await import(
  "../src/lib/notify-customer-order-created"
);
const { notifyLowStock } = await import("../src/lib/notify-low-stock");
const { notifySupplierOrderClosed } = await import(
  "../src/lib/notify-supplier-order-closed"
);
const { notifySupplierOrderChecked } = await import(
  "../src/lib/notify-supplier-order-checked"
);

const sessionUser = {
  sub: "user1",
  email: "ada@example.com",
  name: "Ada Lovelace",
  role: "ADMIN",
};

beforeEach(() => {
  vi.clearAllMocks();
});

function orderRequest(body: unknown): Request {
  return { body, sessionUser } as unknown as Request;
}

describe("customer order stock", () => {
  it("rejects the order when stock is gone inside the transaction", async () => {
    prismaMock.customer.findUnique.mockResolvedValue({ id: "customer1" });
    prismaMock.article.findMany.mockResolvedValue([
      {
        id: "art1",
        code: "BAG",
        name: "Bag",
        stock: 5,
        isActive: true,
      },
    ]);
    prismaMock.customerOrder.findMany.mockResolvedValue([]);
    prismaMock.customerOrder.create.mockResolvedValue({ id: "order1" });
    prismaMock.article.updateMany.mockResolvedValue({ count: 0 });
    prismaMock.article.findUnique.mockResolvedValue({ code: "BAG", stock: 0 });
    const res = mockResponse();

    await createCustomerOrder(
      orderRequest({
        customerId: "customer1",
        lines: [{ articleId: "art1", quantity: 5 }],
      }),
      res as unknown as Response,
    );

    expect(prismaMock.article.updateMany).toHaveBeenCalledWith({
      where: { id: "art1", stock: { gte: 5 } },
      data: { stock: { decrement: 5 } },
    });
    expect(prismaMock.movement.create).not.toHaveBeenCalled();
    expect(notifyCustomerOrderCreated).not.toHaveBeenCalled();
    expect(notifyLowStock).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      error: "Insufficient stock for BAG (available 0, requested 5)",
    });
  });

  it("unloads stock when the quantity is still available", async () => {
    prismaMock.customer.findUnique.mockResolvedValue({ id: "customer1" });
    prismaMock.article.findMany.mockResolvedValue([
      {
        id: "art1",
        code: "BAG",
        name: "Bag",
        stock: 5,
        isActive: true,
      },
    ]);
    prismaMock.customerOrder.findMany.mockResolvedValue([]);
    prismaMock.customerOrder.create.mockResolvedValue({ id: "order1" });
    prismaMock.article.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.article.findUnique.mockResolvedValue({
      id: "art1",
      code: "BAG",
      name: "Bag",
      stock: 3,
      minThreshold: 1,
    });
    prismaMock.movement.create.mockResolvedValue({});
    prismaMock.customerOrder.findUniqueOrThrow.mockResolvedValue({
      id: "order1",
      code: "CO-000001",
      status: "OPEN",
      customer: {
        id: "customer1",
        name: "Ada",
        email: null,
        phone: null,
        address: null,
      },
      createdBy: {
        id: "user1",
        firstName: "Ada",
        lastName: "Lovelace",
        email: "ada@example.com",
      },
      lines: [
        {
          id: "line1",
          articleId: "art1",
          quantity: 2,
          article: { id: "art1", code: "BAG", name: "Bag", stock: 3 },
        },
      ],
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    });
    const res = mockResponse();

    await createCustomerOrder(
      orderRequest({
        customerId: "customer1",
        lines: [{ articleId: "art1", quantity: 2 }],
      }),
      res as unknown as Response,
    );

    expect(res.statusCode).toBe(201);
    expect(prismaMock.movement.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: "UNLOAD",
        delta: -2,
        articleId: "art1",
      }),
    });
    expect(notifyCustomerOrderCreated).toHaveBeenCalledWith(
      expect.objectContaining({
        customerOrderId: "order1",
        orderCode: "CO-000001",
        customerName: "Ada",
        actorUserId: "user1",
      }),
    );
    expect(notifyLowStock).not.toHaveBeenCalled();
  });

  it("warns the team when an unload crosses the minimum", async () => {
    prismaMock.customer.findUnique.mockResolvedValue({ id: "customer1" });
    prismaMock.article.findMany.mockResolvedValue([
      {
        id: "art1",
        code: "BAG",
        name: "Bag",
        stock: 5,
        isActive: true,
      },
    ]);
    prismaMock.customerOrder.findMany.mockResolvedValue([]);
    prismaMock.customerOrder.create.mockResolvedValue({ id: "order1" });
    prismaMock.article.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.article.findUnique.mockResolvedValue({
      id: "art1",
      code: "BAG",
      name: "Bag",
      stock: 1,
      minThreshold: 2,
    });
    prismaMock.movement.create.mockResolvedValue({});
    prismaMock.customerOrder.findUniqueOrThrow.mockResolvedValue({
      id: "order1",
      code: "CO-000001",
      status: "OPEN",
      customer: {
        id: "customer1",
        name: "Ada",
        email: null,
        phone: null,
        address: null,
      },
      createdBy: {
        id: "user1",
        firstName: "Ada",
        lastName: "Lovelace",
        email: "ada@example.com",
      },
      lines: [
        {
          id: "line1",
          articleId: "art1",
          quantity: 2,
          article: { id: "art1", code: "BAG", name: "Bag", stock: 1 },
        },
      ],
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    });
    const res = mockResponse();

    await createCustomerOrder(
      orderRequest({
        customerId: "customer1",
        lines: [{ articleId: "art1", quantity: 2 }],
      }),
      res as unknown as Response,
    );

    expect(res.statusCode).toBe(201);
    expect(notifyLowStock).toHaveBeenCalledWith(
      expect.objectContaining({
        articleId: "art1",
        articleCode: "BAG",
        stock: 1,
        minThreshold: 2,
        actorUserId: "user1",
      }),
    );
  });
});

describe("manual stock adjustment", () => {
  it("rejects a delta that would take stock below zero", async () => {
    prismaMock.article.findUnique.mockResolvedValue({
      id: "art1",
      code: "BAG",
      name: "Bag",
      stock: 3,
    });
    const res = mockResponse();

    await adjustArticleStock(
      {
        params: { id: "art1" },
        body: { delta: -5 },
        sessionUser,
      } as unknown as Request,
      res as unknown as Response,
    );

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      error: "Stock cannot go below zero (current 3, delta -5)",
    });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });
});

describe("supplier order close", () => {
  const closedOrder = {
    id: "so1",
    code: "SO-000001",
    status: "SUCCEEDED",
    supplier: {
      id: "supplier1",
      name: "Acme",
      email: null,
      phone: null,
      address: null,
    },
    createdBy: {
      id: "user1",
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
    },
    closedBy: null,
    lines: [
      {
        id: "line1",
        articleId: "art1",
        qtyOrdered: 4,
        qtyReceivedActual: 4,
        lineConform: true,
        article: {
          id: "art1",
          code: "BAG",
          name: "Bag",
          stock: 9,
          minThreshold: 0,
        },
      },
    ],
    checkedAt: new Date("2026-01-01T00:00:00.000Z"),
    closedAt: new Date("2026-01-02T00:00:00.000Z"),
    adminCloseNote: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-02T00:00:00.000Z"),
  };

  function checkedOrder(status = "CHECKED") {
    return {
      ...closedOrder,
      status,
      closedAt: null,
    };
  }

  it("adds received quantity to stock when the order succeeds", async () => {
    prismaMock.supplierOrder.findUnique.mockResolvedValue(checkedOrder());
    prismaMock.article.update.mockResolvedValue({});
    prismaMock.movement.create.mockResolvedValue({});
    prismaMock.supplierOrder.update.mockResolvedValue({});
    prismaMock.supplierOrder.findUniqueOrThrow.mockResolvedValue(closedOrder);
    const res = mockResponse();

    await closeSupplierOrder(
      {
        params: { id: "so1" },
        body: { outcome: "SUCCEEDED" },
        sessionUser,
      } as unknown as Request,
      res as unknown as Response,
    );

    expect(res.statusCode).toBe(200);
    expect(prismaMock.article.update).toHaveBeenCalledWith({
      where: { id: "art1" },
      data: { stock: { increment: 4 } },
    });
    expect(notifySupplierOrderClosed).toHaveBeenCalledWith(
      expect.objectContaining({
        supplierOrderId: "so1",
        orderCode: "SO-000001",
        supplierName: "Acme",
        outcome: "SUCCEEDED",
        actorUserId: "user1",
      }),
    );
  });

  it("does not change stock when the order is closed with issues", async () => {
    prismaMock.supplierOrder.findUnique.mockResolvedValue(checkedOrder());
    prismaMock.supplierOrder.update.mockResolvedValue({});
    prismaMock.supplierOrder.findUniqueOrThrow.mockResolvedValue({
      ...closedOrder,
      status: "DONE",
      adminCloseNote: "Damaged goods",
    });
    const res = mockResponse();

    await closeSupplierOrder(
      {
        params: { id: "so1" },
        body: { outcome: "DONE", adminCloseNote: "Damaged goods" },
        sessionUser,
      } as unknown as Request,
      res as unknown as Response,
    );

    expect(res.statusCode).toBe(200);
    expect(prismaMock.article.update).not.toHaveBeenCalled();
    expect(notifySupplierOrderClosed).toHaveBeenCalledWith(
      expect.objectContaining({
        outcome: "DONE",
        adminCloseNote: "Damaged goods",
      }),
    );
  });
});

describe("supplier order checking", () => {
  it("notifies the team when checking is complete", async () => {
    prismaMock.supplierOrder.findUnique.mockResolvedValue({
      id: "so1",
      status: "ARRIVED_CHECKING",
      lines: [{ id: "line1" }],
    });
    prismaMock.supplierOrderLine.update.mockResolvedValue({});
    prismaMock.supplierOrder.update.mockResolvedValue({
      id: "so1",
      code: "SO-000001",
      status: "CHECKED",
      supplier: {
        id: "supplier1",
        name: "Acme",
        email: null,
        phone: null,
        address: null,
      },
      createdBy: {
        id: "user1",
        firstName: "Ada",
        lastName: "Lovelace",
        email: "ada@example.com",
      },
      closedBy: null,
      lines: [
        {
          id: "line1",
          articleId: "art1",
          qtyOrdered: 4,
          qtyReceivedActual: 4,
          lineConform: false,
          article: {
            id: "art1",
            code: "BAG",
            name: "Bag",
            stock: 5,
            minThreshold: 0,
          },
        },
      ],
      checkedAt: new Date("2026-01-02T00:00:00.000Z"),
      closedAt: null,
      adminCloseNote: null,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-02T00:00:00.000Z"),
    });
    const res = mockResponse();

    await completeSupplierOrderChecking(
      {
        params: { id: "so1" },
        body: {
          lines: [
            { lineId: "line1", qtyReceivedActual: 4, lineConform: false },
          ],
        },
        sessionUser,
      } as unknown as Request,
      res as unknown as Response,
    );

    expect(res.statusCode).toBe(200);
    expect(notifySupplierOrderChecked).toHaveBeenCalledWith(
      expect.objectContaining({
        supplierOrderId: "so1",
        orderCode: "SO-000001",
        supplierName: "Acme",
        hasNonConformLine: true,
        actorUserId: "user1",
      }),
    );
  });
});
