"use client";

import { usePartyList } from "@/components/party-list/usePartyList";
import { fetchCustomers, type Customer } from "@/lib/customers";

export function useCustomersList() {
  const list = usePartyList<Customer>(
    fetchCustomers,
    "Failed to load customers",
  );

  return {
    customers: list.items,
    loading: list.loading,
    refreshing: list.refreshing,
    error: list.error,
    refresh: list.refresh,
    replaceCustomer: list.replaceItem,
    removeCustomer: list.removeItem,
    prependCustomer: list.prependItem,
  };
}
