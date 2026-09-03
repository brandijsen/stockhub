import { api } from "@/lib/api-client";

export type Supplier = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  orderCount: number;
  createdAt: string;
  updatedAt: string;
};

export type SupplierFormValues = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

export type SuppliersListResponse = {
  suppliers: Supplier[];
};

export type SupplierResponse = {
  supplier: Supplier;
};

export function emptySupplierForm(): SupplierFormValues {
  return {
    name: "",
    email: "",
    phone: "",
    address: "",
  };
}

export function supplierToFormValues(supplier: Supplier): SupplierFormValues {
  return {
    name: supplier.name,
    email: supplier.email ?? "",
    phone: supplier.phone ?? "",
    address: supplier.address ?? "",
  };
}

export function formValuesToPayload(values: SupplierFormValues) {
  return {
    name: values.name.trim(),
    email: values.email.trim() || null,
    phone: values.phone.trim() || null,
    address: values.address.trim() || null,
  };
}

export async function fetchSuppliers(): Promise<Supplier[]> {
  const { data } = await api.get<SuppliersListResponse>("/api/suppliers");
  return data.suppliers;
}

export async function createSupplier(
  values: SupplierFormValues,
): Promise<Supplier> {
  const { data } = await api.post<SupplierResponse>(
    "/api/suppliers",
    formValuesToPayload(values),
  );
  return data.supplier;
}

export async function updateSupplier(
  id: string,
  values: SupplierFormValues,
): Promise<Supplier> {
  const { data } = await api.patch<SupplierResponse>(
    `/api/suppliers/${id}`,
    formValuesToPayload(values),
  );
  return data.supplier;
}

export async function deleteSupplier(id: string): Promise<void> {
  await api.delete(`/api/suppliers/${id}`);
}
