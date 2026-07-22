"use client";

import Link from "next/link";

import {
  formatSupplierOrderDate,
  supplierOrderStatusBadgeClass,
  supplierOrderStatusLabel,
  type SupplierOrder,
} from "@/lib/supplier-orders";

type SupplierOrdersListTableProps = {
  orders: SupplierOrder[];
};

export function SupplierOrdersListTable({
  orders,
}: SupplierOrdersListTableProps) {
  return (
    <div className="mt-6 overflow-x-auto rounded-lg border border-zinc-200">
      <table className="min-w-full divide-y divide-zinc-200 text-sm">
        <thead className="bg-zinc-50 text-left text-zinc-600">
          <tr>
            <th className="px-3 py-3 font-medium">Created</th>
            <th className="px-3 py-3 font-medium">Supplier</th>
            <th className="px-3 py-3 font-medium">Status</th>
            <th className="px-3 py-3 font-medium">Lines</th>
            <th className="px-3 py-3 font-medium">Qty ordered</th>
            <th className="px-3 py-3 font-medium">Created by</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 bg-white">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-zinc-50/80">
              <td className="whitespace-nowrap px-3 py-2 text-zinc-600">
                <Link
                  href={`/supplier-orders/${order.id}`}
                  className="font-medium text-sky-700 hover:text-sky-900"
                >
                  {formatSupplierOrderDate(order.createdAt)}
                </Link>
              </td>
              <td className="px-3 py-2 font-medium text-zinc-900">
                {order.supplier.name}
              </td>
              <td className="px-3 py-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${supplierOrderStatusBadgeClass(order.status)}`}
                >
                  {supplierOrderStatusLabel(order.status)}
                </span>
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-zinc-600">
                {order.lineCount}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-zinc-600">
                {order.totalQtyOrdered}
              </td>
              <td className="px-3 py-2 text-zinc-600">{order.createdBy.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
