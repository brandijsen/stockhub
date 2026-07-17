import type { Supplier } from "@prisma/client";

export type SerializedSupplier = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  orderCount: number;
  createdAt: string;
  updatedAt: string;
};

type SupplierWithCount = Supplier & {
  _count: { orders: number };
};

export function serializeSupplier(supplier: SupplierWithCount): SerializedSupplier {
  return {
    id: supplier.id,
    name: supplier.name,
    email: supplier.email,
    phone: supplier.phone,
    address: supplier.address,
    orderCount: supplier._count.orders,
    createdAt: supplier.createdAt.toISOString(),
    updatedAt: supplier.updatedAt.toISOString(),
  };
}

export const supplierInclude = {
  _count: { select: { orders: true } },
} as const;
