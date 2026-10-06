"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useConfirmDialog } from "@/components/ConfirmDialog";
import { LoadingText } from "@/components/ContentSkeletons";
import {
  OrderDetailError,
  OrderDetailHeader,
  OrderInfoCards,
} from "@/components/orders/OrderDetailLayout";
import { apiErrorMessage } from "@/lib/api-client";
import {
  confirmCustomerOrderPickup,
  customerOrderStatusBadgeClass,
  customerOrderStatusLabel,
  deleteCustomerOrder,
  fetchCustomerOrder,
  formatCustomerOrderDate,
  type CustomerOrder,
} from "@/lib/customer-orders";

type CustomerOrderDetailProps = {
  orderId: string;
  canManage: boolean;
};

export function CustomerOrderDetail({
  orderId,
  canManage,
}: CustomerOrderDetailProps) {
  const router = useRouter();
  const { confirm, dialog } = useConfirmDialog();
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchCustomerOrder(orderId);
        if (!cancelled) {
          setOrder(data);
        }
      } catch (e) {
        if (!cancelled) {
          setError(apiErrorMessage(e, "Failed to load customer order"));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  async function handleConfirmPickup() {
    if (!order) {
      return;
    }

    const confirmed = await confirm({
      title: "Confirm pickup",
      message: "Confirm that the customer has picked up this order?",
      confirmLabel: "Confirm pickup",
    });
    if (!confirmed) {
      return;
    }

    setConfirming(true);
    setActionError(null);
    try {
      const updated = await confirmCustomerOrderPickup(order.id);
      setOrder(updated);
    } catch (e) {
      setActionError(apiErrorMessage(e, "Failed to confirm pickup"));
    } finally {
      setConfirming(false);
    }
  }

  async function handleDelete() {
    if (!order || order.status !== "OPEN") {
      return;
    }

    const confirmed = await confirm({
      title: "Cancel order",
      message: `Cancel order ${order.code} for ${order.customer.name}? Stock for these articles will be restored. This cannot be undone.`,
      confirmLabel: "Cancel order",
      tone: "danger",
    });
    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setActionError(null);
    try {
      await deleteCustomerOrder(order.id);
      router.push("/customer-orders");
    } catch (e) {
      setActionError(apiErrorMessage(e, "Failed to delete customer order"));
    } finally {
      setDeleting(false);
    }
  }

  if (loading && !order) {
    return <LoadingText className="mt-6" />;
  }

  if (error || !order) {
    return (
      <OrderDetailError
        message={error ?? "Customer order not found"}
        backHref="/customer-orders"
        backLabel="Back to customer orders"
      />
    );
  }

  const isOpen = order.status === "OPEN";
  const canEditOpen = canManage && isOpen;

  return (
    <div>
      {dialog}
      <OrderDetailHeader
        backHref="/customer-orders"
        backLabel="Customer orders"
        code={order.code}
        title={order.customer.name}
        statusLabel={customerOrderStatusLabel(order.status)}
        statusBadgeClass={customerOrderStatusBadgeClass(order.status)}
        createdAt={order.createdAt}
        createdByName={order.createdBy.name}
        createdByEmail={order.createdBy.email}
        updatedAt={order.updatedAt}
        formatDate={formatCustomerOrderDate}
        actions={
          <>
            {isOpen ? (
              <button
                type="button"
                disabled={confirming || deleting}
                onClick={() => void handleConfirmPickup()}
                className="rounded-lg bg-sky-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-sky-800 disabled:opacity-50"
              >
                {confirming ? "Confirming…" : "Confirm pickup"}
              </button>
            ) : null}
            {canEditOpen ? (
              <>
                <Link
                  href={`/customer-orders/${order.id}/edit`}
                  className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  disabled={deleting || confirming}
                  onClick={() => void handleDelete()}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                >
                  {deleting ? "Cancelling…" : "Cancel order"}
                </button>
              </>
            ) : null}
          </>
        }
      />

      {actionError ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {actionError}
        </p>
      ) : null}

      <OrderInfoCards
        partyTitle="Customer"
        partyName={order.customer.name}
        partyEmail={order.customer.email}
        partyPhone={order.customer.phone}
        partyAddress={order.customer.address}
        lineCount={order.lineCount}
        totalQty={order.totalQuantity}
        totalQtyLabel="units"
      />

      <div className="mt-6 max-w-full overflow-x-auto rounded-lg border border-zinc-200">
        <table className="min-w-full divide-y divide-zinc-200 text-sm">
          <thead className="bg-zinc-50 text-left text-zinc-600">
            <tr>
              <th className="px-3 py-3 font-medium">Code</th>
              <th className="px-3 py-3 font-medium">Article</th>
              <th className="px-3 py-3 font-medium">Stock now</th>
              <th className="px-3 py-3 font-medium">Qty</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 bg-white">
            {order.lines.map((line) => (
              <tr key={line.id}>
                <td className="whitespace-nowrap px-3 py-2 font-mono text-zinc-900">
                  {line.article.code}
                </td>
                <td className="px-3 py-2 text-zinc-900">{line.article.name}</td>
                <td className="whitespace-nowrap px-3 py-2 text-zinc-600">
                  {line.article.stock}
                </td>
                <td className="whitespace-nowrap px-3 py-2 font-medium text-zinc-900">
                  {line.quantity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isOpen ? (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-950">
            {canEditOpen
              ? "Stock was unloaded when this order was created. Edit or cancel it before pickup and stock will follow the change. Confirm pickup when the customer collects the goods — no further stock change."
              : "Stock was unloaded when this order was created. Confirm pickup when the customer collects the goods — no further stock change."}
          </p>
        </div>
      ) : (
        <p className="mt-6 text-sm text-zinc-600">
          Pickup confirmed. This order is complete.
        </p>
      )}
    </div>
  );
}
