"use client";

import Link from "next/link";

import { Spinner } from "@/components/Spinner";
import { ArticlesListPagination } from "@/components/articles-list/ArticlesListPagination";

import { SupplierOrdersListTable } from "./supplier-orders-list/SupplierOrdersListTable";
import { useSupplierOrdersList } from "./supplier-orders-list/useSupplierOrdersList";

type SupplierOrdersListProps = {
  canManage: boolean;
};

export function SupplierOrdersList({ canManage }: SupplierOrdersListProps) {
  const list = useSupplierOrdersList();

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

      {list.error ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {list.error}
        </p>
      ) : null}

      {list.loading ? (
        <div className="mt-8 flex items-center gap-2 text-zinc-600">
          <Spinner label="Loading supplier orders" />
          <span>Loading supplier orders…</span>
        </div>
      ) : list.total === 0 ? (
        <p className="mt-8 text-zinc-600">
          No supplier orders yet.
          {canManage ? " Create the first purchase order." : null}
        </p>
      ) : (
        <>
          <SupplierOrdersListTable orders={list.orders} />
          <ArticlesListPagination
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
        </>
      )}
    </div>
  );
}
