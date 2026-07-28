"use client";

import { useCallback, useEffect, useState } from "react";

import { apiErrorMessage } from "@/lib/api-client";
import {
  fetchCustomerOrders,
  type CustomerOrder,
} from "@/lib/customer-orders";

const PAGE_SIZE = 10;

export function useCustomerOrdersList() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (targetPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCustomerOrders({
        page: targetPage,
        limit: PAGE_SIZE,
      });
      setOrders(data.orders);
      setPage(data.page);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (e) {
      setError(apiErrorMessage(e, "Failed to load customer orders"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(page);
  }, [load, page]);

  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  return {
    orders,
    page,
    totalPages,
    total,
    loading,
    error,
    rangeStart,
    rangeEnd,
    setPage,
    reload: () => load(page),
  };
}
