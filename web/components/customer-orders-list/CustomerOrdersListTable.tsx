"use client";

import Link from "next/link";

import {
  customerOrderStatusLabel,
  formatCustomerOrderDate,
  type CustomerOrder,
} from "@/lib/customer-orders";

type CustomerOrdersListTableProps = {
  orders: CustomerOrder[];
};

export function CustomerOrdersListTable({
  orders,
}: CustomerOrdersListTableProps) {
  return (
    <div className="mt-6 overflow-x-auto rounded-lg border border-zinc-200">
      <table className="min-w-full divide-y divide-zinc-200 text-sm">
        <thead className="bg-zinc-50 text-left text-zinc-600">
          <tr>
            <th className="px-3 py-3 font-medium">Customer</th>
            <th className="px-3 py-3 font-medium">Status</th>
            <th className="px-3 py-3 font-medium">Lines</th>
            <th className="px-3 py-3 font-medium">Created</th>
            <th className="px-3 py-3 font-medium">Detail</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 bg-white">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-zinc-50/80">
              <td className="px-3 py-2 font-medium text-zinc-900">
                {order.customer.name}
              </td>
              <td className="px-3 py-2 text-zinc-600">
                {customerOrderStatusLabel(order.status)}
              </td>
              <td className="px-3 py-2 text-zinc-600">{order.lineCount}</td>
              <td className="whitespace-nowrap px-3 py-2 text-zinc-600">
                {formatCustomerOrderDate(order.createdAt)}
              </td>
              <td className="px-3 py-2">
                <Link
                  href={`/customer-orders/${order.id}`}
                  className="text-sm font-medium text-sky-700 hover:text-sky-900"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
