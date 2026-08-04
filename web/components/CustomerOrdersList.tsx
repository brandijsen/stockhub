"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { ArticlesListPagination } from "@/components/articles-list/ArticlesListPagination";
import { ListFilterBanner } from "@/components/ListFilterBanner";
import { Spinner } from "@/components/Spinner";
import {
  customerOrderStatusLabel,
  parseCustomerOrderStatusParam,
} from "@/lib/customer-orders";

import { CustomerOrdersListTable } from "./customer-orders-list/CustomerOrdersListTable";
import { useCustomerOrdersList } from "./customer-orders-list/useCustomerOrdersList";

type CustomerOrdersListProps = {
  canManage: boolean;
};

export function CustomerOrdersList({ canManage }: CustomerOrdersListProps) {
  const searchParams = useSearchParams();
  const statusFilter = parseCustomerOrderStatusParam(searchParams.get("status"));
  const { orders, page, totalPages, total, loading, error, rangeStart, rangeEnd, setPage } =
    useCustomerOrdersList({ status: statusFilter });

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">
            Customer orders
          </h1>
          <p className="mt-1 text-zinc-600">
            Sales orders unload stock when created. Confirm pickup when the
            customer collects the goods.
          </p>
        </div>
        {canManage ? (
          <Link
            href="/customer-orders/new"
            className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800"
          >
            New order
          </Link>
        ) : null}
      </div>

      {statusFilter ? (
        <ListFilterBanner
          label={`Status: ${customerOrderStatusLabel(statusFilter)}`}
          clearHref="/customer-orders"
        />
      ) : null}

      {error ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="mt-8 flex items-center gap-2 text-zinc-600">
          <Spinner label="Loading customer orders" />
          <span>Loading customer orders…</span>
        </div>
      ) : orders.length === 0 ? (
        <p className="mt-8 text-zinc-600">
          {statusFilter
            ? "No customer orders match this filter."
            : "No customer orders yet."}
          {!statusFilter && canManage ? " Create the first order to get started." : null}
        </p>
      ) : (
        <>
          <CustomerOrdersListTable orders={orders} />
          <ArticlesListPagination
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            total={total}
            page={page}
            totalPages={totalPages}
            loading={loading}
            onPrevious={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
          />
        </>
      )}
    </div>
  );
}
