"use client";

import { OrdersListTable } from "@/components/orders/OrdersListTable";
import {
  customerOrderStatusBadgeClass,
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
    <OrdersListTable
      orders={orders.map((order) => ({
        id: order.id,
        code: order.code,
        partyName: order.customer.name,
        statusLabel: customerOrderStatusLabel(order.status),
        statusBadgeClass: customerOrderStatusBadgeClass(order.status),
        lineCount: order.lineCount,
        totalQty: order.totalQuantity,
        createdAt: order.createdAt,
        createdByName: order.createdBy.name,
        detailHref: `/customer-orders/${order.id}`,
      }))}
      formatDate={formatCustomerOrderDate}
      totalQtyHeader="Total qty"
    />
  );
}
