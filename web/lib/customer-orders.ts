import { api } from "@/lib/api-client";

export type CustomerOrderLine = {
  id: string;
  articleId: string;
  quantity: number;
  article: {
    id: string;
    code: string;
    name: string;
    stock: number;
  };
};

export type CustomerOrder = {
  id: string;
  status: "OPEN" | "PICKED_UP";
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  lines: CustomerOrderLine[];
  lineCount: number;
  totalQuantity: number;
  createdAt: string;
  updatedAt: string;
};

export type CustomerOrdersListResponse = {
  orders: CustomerOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type CustomerOrderResponse = {
  order: CustomerOrder;
};

export type CreateCustomerOrderLineInput = {
  articleId: string;
  quantity: number;
};

export async function fetchCustomerOrders(params?: {
  page?: number;
  limit?: number;
  status?: CustomerOrder["status"];
}): Promise<CustomerOrdersListResponse> {
  const { data } = await api.get<CustomerOrdersListResponse>(
    "/api/customer-orders",
    { params },
  );
  return data;
}

export async function fetchCustomerOrder(id: string): Promise<CustomerOrder> {
  const { data } = await api.get<CustomerOrderResponse>(
    `/api/customer-orders/${id}`,
  );
  return data.order;
}

export async function createCustomerOrder(payload: {
  customerId: string;
  lines: CreateCustomerOrderLineInput[];
}): Promise<CustomerOrder> {
  const { data } = await api.post<CustomerOrderResponse>(
    "/api/customer-orders",
    payload,
  );
  return data.order;
}

export async function confirmCustomerOrderPickup(
  id: string,
): Promise<CustomerOrder> {
  const { data } = await api.post<CustomerOrderResponse>(
    `/api/customer-orders/${id}/confirm-pickup`,
  );
  return data.order;
}

export function formatCustomerOrderDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function customerOrderStatusLabel(status: CustomerOrder["status"]): string {
  switch (status) {
    case "OPEN":
      return "Open";
    case "PICKED_UP":
      return "Picked up";
    default:
      return status;
  }
}

const CUSTOMER_ORDER_STATUSES: CustomerOrder["status"][] = ["OPEN", "PICKED_UP"];

export function parseCustomerOrderStatusParam(
  value: string | null,
): CustomerOrder["status"] | undefined {
  if (!value) {
    return undefined;
  }
  return CUSTOMER_ORDER_STATUSES.includes(value as CustomerOrder["status"])
    ? (value as CustomerOrder["status"])
    : undefined;
}
