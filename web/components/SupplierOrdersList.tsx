"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { LoadingText } from "@/components/ContentSkeletons";
import { ListFilterBanner } from "@/components/ListFilterBanner";
import { ListPagination } from "@/components/ListPagination";
import {
  parseSupplierOrderStatusParam,
  supplierOrderStatusLabel,
} from "@/lib/supplier-orders";

import { SupplierOrdersListTable } from "./supplier-orders-list/SupplierOrdersListTable";
import { useSupplierOrdersList } from "./supplier-orders-list/useSupplierOrdersList";

type SupplierOrdersListProps = {
  canManage: boolean;
};

export function SupplierOrdersList({ canManage }: SupplierOrdersListProps) {
  const searchParams = useSearchParams();
  const statusFilter = parseSupplierOrderStatusParam(searchParams.get("status"));
  const list = useSupplierOrdersList({ status: statusFilter });
  const initialLoad = list.loading && list.orders.length === 0;
  const refreshing = list.loading && list.orders.length > 0;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">
            Supplier orders
          </h1>
          <p className="mt-1 text-zinc-600">
            Purchase orders to suppliers. New orders start as{" "}
            <span className="font-medium text-zinc-800">Pending</span> until
            goods arrive.
          </p>
        </div>
        {canManage ? (
          <Link
            href="/supplier-orders/new"
            className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800"
          >
            New order
          </Link>
        ) : null}
      </div>

      {statusFilter ? (
        <ListFilterBanner
          label={`Status: ${supplierOrderStatusLabel(statusFilter)}`}
          clearHref="/supplier-orders"
        />
      ) : null}

      {list.error ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {list.error}
        </p>
      ) : null}

      {initialLoad ? (
        <LoadingText />
      ) : list.total === 0 ? (
        <p className="mt-8 text-zinc-600">
          {statusFilter
            ? "No supplier orders match this filter."
            : "No supplier orders yet."}
          {!statusFilter && canManage ? " Create the first purchase order." : null}
        </p>
      ) : (
        <div className={refreshing ? "opacity-60" : undefined}>
          <SupplierOrdersListTable orders={list.orders} />
          <ListPagination
            rangeStart={list.rangeStart}
            rangeEnd={list.rangeEnd}
            total={list.total}
            page={list.page}
            totalPages={list.totalPages}
            loading={list.loading}
            onPrevious={() => list.setPage((p) => Math.max(1, p - 1))}
            onNext={() =>
              list.setPage((p) => Math.min(list.totalPages, p + 1))
            }
          />
        </div>
      )}
    </div>
  );
}
