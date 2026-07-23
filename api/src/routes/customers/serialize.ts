import type { Customer } from "@prisma/client";

export type SerializedCustomer = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  orderCount: number;
  createdAt: string;
  updatedAt: string;
};

type CustomerWithCount = Customer & {
  _count: { orders: number };
};

export function serializeCustomer(customer: CustomerWithCount): SerializedCustomer {
  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
    orderCount: customer._count.orders,
    createdAt: customer.createdAt.toISOString(),
    updatedAt: customer.updatedAt.toISOString(),
  };
}

export const customerInclude = {
  _count: { select: { orders: true } },
} as const;
