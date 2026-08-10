import Link from "next/link";

export type OrderListItem = {
  id: string;
  code: string;
  partyName: string;
  statusLabel: string;
  statusBadgeClass: string;
  lineCount: number;
  totalQty: number;
  createdAt: string;
  createdByName: string;
  detailHref: string;
};

type OrdersListTableProps = {
  orders: OrderListItem[];
  formatDate: (iso: string) => string;
  totalQtyHeader?: string;
};

export function OrdersListTable({
  orders,
  formatDate,
  totalQtyHeader = "Total qty",
}: OrdersListTableProps) {
  return (
    <div className="mt-6 overflow-x-auto rounded-lg border border-zinc-200">
      <table className="min-w-full divide-y divide-zinc-200 text-sm">
        <thead className="bg-zinc-50 text-left text-zinc-600">
          <tr>
            <th className="px-3 py-3 font-medium">Order</th>
            <th className="px-3 py-3 font-medium">Party</th>
            <th className="px-3 py-3 font-medium">Status</th>
            <th className="px-3 py-3 font-medium">Lines</th>
            <th className="px-3 py-3 font-medium">{totalQtyHeader}</th>
            <th className="px-3 py-3 font-medium">Created</th>
            <th className="px-3 py-3 font-medium">Created by</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 bg-white">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-zinc-50/80">
              <td className="whitespace-nowrap px-3 py-2">
                <Link
                  href={order.detailHref}
                  className="font-mono text-sm font-medium text-sky-700 hover:text-sky-900"
                >
                  {order.code}
                </Link>
              </td>
              <td className="px-3 py-2 font-medium text-zinc-900">
                {order.partyName}
              </td>
              <td className="px-3 py-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${order.statusBadgeClass}`}
                >
                  {order.statusLabel}
                </span>
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-zinc-600">
                {order.lineCount}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-zinc-600">
                {order.totalQty}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-zinc-600">
                {formatDate(order.createdAt)}
              </td>
              <td className="px-3 py-2 text-zinc-600">{order.createdByName}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
