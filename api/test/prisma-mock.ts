import { vi } from "vitest";

function createPrismaMock() {
  const prisma = {
    article: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    pendingRegistration: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    customer: {
      findUnique: vi.fn(),
    },
    customerOrder: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUniqueOrThrow: vi.fn(),
    },
    movement: {
      create: vi.fn(),
    },
    supplierOrder: {
      findUnique: vi.fn(),
      findUniqueOrThrow: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    supplierOrderLine: {
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  };

  prisma.$transaction.mockImplementation(async (work: unknown) => {
    if (typeof work === "function") {
      return work(prisma);
    }
    return Promise.all(work as Promise<unknown>[]);
  });

  return prisma;
}

export const prismaMock = createPrismaMock();
