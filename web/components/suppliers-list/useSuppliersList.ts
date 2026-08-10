"use client";

import { usePartyList } from "@/components/party-list/usePartyList";
import { fetchSuppliers, type Supplier } from "@/lib/suppliers";

export function useSuppliersList() {
  const list = usePartyList<Supplier>(
    fetchSuppliers,
    "Failed to load suppliers",
  );

  return {
    suppliers: list.items,
    loading: list.loading,
    refreshing: list.refreshing,
    error: list.error,
    refresh: list.refresh,
    replaceSupplier: list.replaceItem,
    removeSupplier: list.removeItem,
    prependSupplier: list.prependItem,
  };
}
