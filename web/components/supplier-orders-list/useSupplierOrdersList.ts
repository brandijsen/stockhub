"use client";

import { useCallback, useEffect, useState } from "react";

import { apiErrorMessage } from "@/lib/api-client";
import {
  fetchSupplierOrders,
  SUPPLIER_ORDERS_PAGE_SIZE,
  type SupplierOrder,
  type SupplierOrderStatus,
} from "@/lib/supplier-orders";

type UseSupplierOrdersListOptions = {
  status?: SupplierOrderStatus;
};

export function useSupplierOrdersList(options: UseSupplierOrdersListOptions = {}) {
  const { status } = options;
  const [orders, setOrders] = useState<SupplierOrder[]>([]);
  const [page, setPage] = useState(1);
  const [appliedStatus, setAppliedStatus] = useState(status);
  const pageToLoad = status === appliedStatus ? page : 1;
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(
    async (pageToLoad: number) => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchSupplierOrders(pageToLoad, status);
        setOrders(data.orders);
        setPage(data.page);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } catch (e) {
        setError(apiErrorMessage(e, "Failed to load supplier orders"));
      } finally {
        setLoading(false);
      }
    },
    [status],
  );

  useEffect(() => {
    if (status !== appliedStatus) {
      setAppliedStatus(status);
      setPage(1);
    }
  }, [appliedStatus, status]);

  useEffect(() => {
    void loadOrders(pageToLoad);
  }, [loadOrders, pageToLoad]);

  const rangeStart = total === 0 ? 0 : (page - 1) * SUPPLIER_ORDERS_PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * SUPPLIER_ORDERS_PAGE_SIZE, total);

  return {
    orders,
    page,
    total,
    totalPages,
    loading,
    error,
    status,
    rangeStart,
    rangeEnd,
    setPage,
    reload: () => loadOrders(page),
  };
}
