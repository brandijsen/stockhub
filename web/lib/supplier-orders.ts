import { api } from "@/lib/api-client";

export const SUPPLIER_ORDERS_PAGE_SIZE = 10;

export type SupplierOrderStatus =
  | "PENDING"
  | "ARRIVED_CHECKING"
  | "CHECKED"
  | "SUCCEEDED"
  | "DONE";

export type SupplierOrderLine = {
  id: string;
  articleId: string;
  qtyOrdered: number;
  qtyReceivedActual: number | null;
  lineConform: boolean | null;
  article: {
    id: string;
    code: string;
    name: string;
    stock: number;
    minThreshold: number;
    lowStock: boolean;
  };
};

export type SupplierOrder = {
  id: string;
  status: SupplierOrderStatus;
  supplier: {
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
  lines: SupplierOrderLine[];
  lineCount: number;
  totalQtyOrdered: number;
  checkedAt: string | null;
  closedAt: string | null;
  adminCloseNote: string | null;
  closedBy: {
    id: string;
    name: string;
    email: string;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export type SupplierOrdersListResponse = {
  orders: SupplierOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type SupplierOrderResponse = {
  order: SupplierOrder;
};

export type CreateSupplierOrderLineInput = {
  articleId: string;
  qtyOrdered: number;
};

export type CreateSupplierOrderResponse = {
  order: SupplierOrder;
  supplierEmailSent: boolean;
  supplierEmailError?: string;
};

export type CloseSupplierOrderResponse = {
  order: SupplierOrder;
  supplierEmailSent: boolean;
  supplierEmailError?: string;
};

export type CloseSupplierOrderOutcome = "SUCCEEDED" | "DONE";

export type UpdateSupplierOrderResponse = CreateSupplierOrderResponse;

export type DeleteSupplierOrderResponse = {
  ok: true;
  supplierEmailSent: boolean;
  supplierEmailError?: string;
};

export function supplierOrderStatusLabel(status: SupplierOrderStatus): string {
  switch (status) {
    case "PENDING":
      return "Pending";
    case "ARRIVED_CHECKING":
      return "Arrived — checking";
    case "CHECKED":
      return "Checked";
    case "SUCCEEDED":
      return "Succeeded";
    case "DONE":
      return "Done (issues)";
    default:
      return status;
  }
}

export function supplierOrderStatusBadgeClass(status: SupplierOrderStatus): string {
  switch (status) {
    case "PENDING":
      return "bg-amber-100 text-amber-900";
    case "ARRIVED_CHECKING":
      return "bg-sky-100 text-sky-900";
    case "CHECKED":
      return "bg-violet-100 text-violet-900";
    case "SUCCEEDED":
      return "bg-emerald-100 text-emerald-900";
    case "DONE":
      return "bg-red-100 text-red-900";
    default:
      return "bg-zinc-100 text-zinc-700";
  }
}

export function formatSupplierOrderDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export async function fetchSupplierOrders(
  page = 1,
): Promise<SupplierOrdersListResponse> {
  const { data } = await api.get<SupplierOrdersListResponse>(
    "/api/supplier-orders",
    { params: { page, limit: SUPPLIER_ORDERS_PAGE_SIZE } },
  );
  return data;
}

export async function fetchSupplierOrder(id: string): Promise<SupplierOrder> {
  const { data } = await api.get<SupplierOrderResponse>(
    `/api/supplier-orders/${id}`,
  );
  return data.order;
}

export async function createSupplierOrder(params: {
  supplierId: string;
  lines: CreateSupplierOrderLineInput[];
}): Promise<CreateSupplierOrderResponse> {
  const { data } = await api.post<CreateSupplierOrderResponse>(
    "/api/supplier-orders",
    params,
  );
  return data;
}

export async function updateSupplierOrder(
  id: string,
  params: {
    supplierId: string;
    lines: CreateSupplierOrderLineInput[];
  },
): Promise<UpdateSupplierOrderResponse> {
  const { data } = await api.patch<UpdateSupplierOrderResponse>(
    `/api/supplier-orders/${id}`,
    params,
  );
  return data;
}

export async function deleteSupplierOrder(
  id: string,
): Promise<DeleteSupplierOrderResponse> {
  const { data } = await api.delete<DeleteSupplierOrderResponse>(
    `/api/supplier-orders/${id}`,
  );
  return data;
}

export async function declareSupplierOrderArrived(
  id: string,
): Promise<SupplierOrder> {
  const { data } = await api.post<SupplierOrderResponse>(
    `/api/supplier-orders/${id}/declare-arrived`,
  );
  return data.order;
}

export type CompleteCheckingLineInput = {
  lineId: string;
  qtyReceivedActual: number;
  lineConform: boolean;
};

export async function completeSupplierOrderChecking(
  id: string,
  lines: CompleteCheckingLineInput[],
): Promise<SupplierOrder> {
  const { data } = await api.post<SupplierOrderResponse>(
    `/api/supplier-orders/${id}/complete-checking`,
    { lines },
  );
  return data.order;
}

export async function closeSupplierOrder(
  id: string,
  params: {
    outcome: CloseSupplierOrderOutcome;
    adminCloseNote?: string | null;
  },
): Promise<CloseSupplierOrderResponse> {
  const { data } = await api.post<CloseSupplierOrderResponse>(
    `/api/supplier-orders/${id}/close`,
    params,
  );
  return data;
}
