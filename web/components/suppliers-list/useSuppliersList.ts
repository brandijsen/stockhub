"use client";

import { useCallback, useEffect, useState } from "react";

import { apiErrorMessage } from "@/lib/api-client";
import { fetchSuppliers, type Supplier } from "@/lib/suppliers";

export function useSuppliersList() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSuppliers = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const list = await fetchSuppliers();
      setSuppliers(list);
    } catch (e) {
      setError(apiErrorMessage(e, "Failed to load suppliers"));
    } finally {
      if (silent) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadSuppliers();
  }, [loadSuppliers]);

  return {
    suppliers,
    loading,
    refreshing,
    error,
    refresh: () => loadSuppliers({ silent: true }),
    replaceSupplier: (updated: Supplier) => {
      setSuppliers((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    },
    removeSupplier: (id: string) => {
      setSuppliers((current) => current.filter((item) => item.id !== id));
    },
    prependSupplier: (supplier: Supplier) => {
      setSuppliers((current) =>
        [...current, supplier].sort((a, b) => a.name.localeCompare(b.name)),
      );
    },
  };
}
