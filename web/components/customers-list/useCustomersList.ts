"use client";

import { useCallback, useEffect, useState } from "react";

import { apiErrorMessage } from "@/lib/api-client";
import { fetchCustomers, type Customer } from "@/lib/customers";

export function useCustomersList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCustomers = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const list = await fetchCustomers();
      setCustomers(list);
    } catch (e) {
      setError(apiErrorMessage(e, "Failed to load customers"));
    } finally {
      if (silent) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadCustomers();
  }, [loadCustomers]);

  return {
    customers,
    loading,
    refreshing,
    error,
    refresh: () => loadCustomers({ silent: true }),
    replaceCustomer: (updated: Customer) => {
      setCustomers((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    },
    removeCustomer: (id: string) => {
      setCustomers((current) => current.filter((item) => item.id !== id));
    },
    prependCustomer: (customer: Customer) => {
      setCustomers((current) =>
        [...current, customer].sort((a, b) => a.name.localeCompare(b.name)),
      );
    },
  };
}
