import { api } from "@/lib/api-client";

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  orderCount: number;
  createdAt: string;
  updatedAt: string;
};

export type CustomerFormValues = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

export type CustomersListResponse = {
  customers: Customer[];
};

export type CustomerResponse = {
  customer: Customer;
};

export function emptyCustomerForm(): CustomerFormValues {
  return {
    name: "",
    email: "",
    phone: "",
    address: "",
  };
}

export function customerToFormValues(customer: Customer): CustomerFormValues {
  return {
    name: customer.name,
    email: customer.email,
    phone: customer.phone ?? "",
    address: customer.address ?? "",
  };
}

export function formValuesToPayload(values: CustomerFormValues) {
  return {
    name: values.name.trim(),
    email: values.email.trim(),
    phone: values.phone.trim() || null,
    address: values.address.trim() || null,
  };
}

export async function fetchCustomers(): Promise<Customer[]> {
  const { data } = await api.get<CustomersListResponse>("/api/customers");
  return data.customers;
}

export async function createCustomer(
  values: CustomerFormValues,
): Promise<Customer> {
  const { data } = await api.post<CustomerResponse>(
    "/api/customers",
    formValuesToPayload(values),
  );
  return data.customer;
}

export async function updateCustomer(
  id: string,
  values: CustomerFormValues,
): Promise<Customer> {
  const { data } = await api.patch<CustomerResponse>(
    `/api/customers/${id}`,
    formValuesToPayload(values),
  );
  return data.customer;
}

export async function deleteCustomer(id: string): Promise<void> {
  await api.delete(`/api/customers/${id}`);
}
