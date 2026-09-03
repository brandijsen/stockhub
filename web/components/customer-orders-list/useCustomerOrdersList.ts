"use client";

import { useCallback, useEffect, useState } from "react";

import { apiErrorMessage } from "@/lib/api-client";
import {
  fetchCustomerOrders,
  type CustomerOrder,
  type CustomerOrderListItem,
} from "@/lib/customer-orders";

const PAGE_SIZE = 10;

type UseCustomerOrdersListOptions = {
  status?: CustomerOrder["status"];
};

export function useCustomerOrdersList(
  options: UseCustomerOrdersListOptions = {},
) {
  const { status } = options;
  const [orders, setOrders] = useState<CustomerOrderListItem[]>([]);
  const [page, setPage] = useState(1);
  const [appliedStatus, setAppliedStatus] = useState(status);
  const pageToLoad = status === appliedStatus ? page : 1;
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (targetPage: number) => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchCustomerOrders({
          page: targetPage,
          limit: PAGE_SIZE,
          status,
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
    void load(pageToLoad);
  }, [load, pageToLoad]);

  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  return {
    orders,
    page,
    totalPages,
    total,
    loading,
    error,
    status,
    rangeStart,
    rangeEnd,
    setPage,
    reload: () => load(page),
  };
}
