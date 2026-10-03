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

const { createCustomerOrder } = await import(
  "../src/routes/customer-orders/handlers/create"
);
const { adjustArticleStock } = await import(
  "../src/routes/articles/handlers/adjust-stock"
);
const { closeSupplierOrder } = await import(
  "../src/routes/supplier-orders/handlers/close"
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
  });
});
