"use client";

import { OrdersListTable } from "@/components/orders/OrdersListTable";
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
    <OrdersListTable
      orders={orders.map((order) => ({
        id: order.id,
        code: order.code,
        partyName: order.supplier.name,
        statusLabel: supplierOrderStatusLabel(order.status),
        statusBadgeClass: supplierOrderStatusBadgeClass(order.status),
        lineCount: order.lineCount,
        totalQty: order.totalQtyOrdered,
        createdAt: order.createdAt,
        createdByName: order.createdBy.name,
        detailHref: `/supplier-orders/${order.id}`,
      }))}
      formatDate={formatSupplierOrderDate}
      totalQtyHeader="Qty ordered"
    />
  );
}
