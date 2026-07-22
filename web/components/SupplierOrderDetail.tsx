"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Spinner } from "@/components/Spinner";
import { apiErrorMessage } from "@/lib/api-client";
import {
  deleteSupplierOrder,
  declareSupplierOrderArrived,
  fetchSupplierOrder,
  supplierOrderStatusBadgeClass,
  supplierOrderStatusLabel,
  formatSupplierOrderDate,
  type SupplierOrder,
} from "@/lib/supplier-orders";
import { SupplierOrderCheckingSection } from "@/components/supplier-orders/SupplierOrderCheckingSection";
import { SupplierOrderCloseSection } from "@/components/supplier-orders/SupplierOrderCloseSection";

type SupplierOrderDetailProps = {
  orderId: string;
  canManage: boolean;
};

export function SupplierOrderDetail({
  orderId,
  canManage,
}: SupplierOrderDetailProps) {
  const router = useRouter();
  const [order, setOrder] = useState<SupplierOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [declaring, setDeclaring] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchSupplierOrder(orderId);
        if (!cancelled) {
          setOrder(data);
        }
      } catch (e) {
        if (!cancelled) {
          setError(apiErrorMessage(e, "Failed to load supplier order"));
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

  async function handleDeclareArrived() {
    if (!order || order.status !== "PENDING") {
      return;
    }

    const confirmed = window.confirm(
      `Mark the order for ${order.supplier.name} as arrived? Other team members will be notified.`,
    );
    if (!confirmed) {
      return;
    }

    setDeclaring(true);
    setActionError(null);
    try {
      const updated = await declareSupplierOrderArrived(order.id);
      setOrder(updated);
    } catch (e) {
      setActionError(apiErrorMessage(e, "Failed to declare order arrived"));
    } finally {
      setDeclaring(false);
    }
  }

  async function handleDelete() {
    if (!order || order.status !== "PENDING") {
      return;
    }

    const confirmed = window.confirm(
      `Cancel order for ${order.supplier.name}? The supplier will be notified by email when mail is configured.`,
    );
    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setActionError(null);
    try {
      await deleteSupplierOrder(order.id);
      router.push("/supplier-orders");
    } catch (e) {
      setActionError(apiErrorMessage(e, "Failed to delete supplier order"));
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-zinc-600">
        <Spinner label="Loading supplier order" />
        <span>Loading order…</span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div>
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error ?? "Order not found"}
        </p>
        <Link
          href="/supplier-orders"
          className="mt-4 inline-block text-sm font-medium text-sky-700 hover:text-sky-900"
        >
          ← Back to supplier orders
        </Link>
      </div>
    );
  }

  const canEditPending = canManage && order.status === "PENDING";
  const canDeclareArrived = order.status === "PENDING";
  const showCheckingForm = order.status === "ARRIVED_CHECKING";
  const showCloseForm = canManage && order.status === "CHECKED";
  const showCheckingResults =
    order.status === "CHECKED" ||
    order.status === "SUCCEEDED" ||
    order.status === "DONE";

  return (
    <div>
      <Link
        href="/supplier-orders"
        className="text-sm font-medium text-sky-700 hover:text-sky-900"
      >
        ← Supplier orders
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">
            {order.supplier.name}
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            Created {formatSupplierOrderDate(order.createdAt)} by{" "}
            {order.createdBy.name}
          </p>
          {order.checkedAt ? (
            <p className="mt-1 text-sm text-zinc-500">
              Checked {formatSupplierOrderDate(order.checkedAt)}
            </p>
          ) : null}
          {order.closedAt ? (
            <p className="mt-1 text-sm text-zinc-500">
              Closed {formatSupplierOrderDate(order.closedAt)}
              {order.closedBy ? ` by ${order.closedBy.name}` : ""}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${supplierOrderStatusBadgeClass(order.status)}`}
          >
            {supplierOrderStatusLabel(order.status)}
          </span>
          {canDeclareArrived ? (
            <button
              type="button"
              disabled={declaring}
              onClick={() => void handleDeclareArrived()}
              className="rounded-lg bg-sky-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-sky-800 disabled:opacity-50"
            >
              {declaring ? "Updating…" : "Declare arrived"}
            </button>
          ) : null}
          {canEditPending ? (
            <>
              <Link
                href={`/supplier-orders/${order.id}/edit`}
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                Edit
              </Link>
              <button
                type="button"
                disabled={deleting}
                onClick={() => void handleDelete()}
                className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                {deleting ? "Cancelling…" : "Cancel order"}
              </button>
            </>
          ) : null}
        </div>
      </div>

      {actionError ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {actionError}
        </p>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm">
          <h2 className="font-medium text-zinc-900">Supplier</h2>
          <p className="mt-2 text-zinc-600">{order.supplier.email}</p>
          {order.supplier.phone ? (
            <p className="text-zinc-600">{order.supplier.phone}</p>
          ) : null}
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm">
          <h2 className="font-medium text-zinc-900">Summary</h2>
          <p className="mt-2 text-zinc-600">
            {order.lineCount} line{order.lineCount === 1 ? "" : "s"} ·{" "}
            {order.totalQtyOrdered} units ordered
          </p>
          <p className="mt-1 font-mono text-xs text-zinc-500">{order.id}</p>
        </div>
      </div>

      {!showCheckingForm ? (
      <div className="mt-6 overflow-x-auto rounded-lg border border-zinc-200">
        <table className="min-w-full divide-y divide-zinc-200 text-sm">
          <thead className="bg-zinc-50 text-left text-zinc-600">
            <tr>
              <th className="px-3 py-3 font-medium">Code</th>
              <th className="px-3 py-3 font-medium">Article</th>
              <th className="px-3 py-3 font-medium">Stock now</th>
              <th className="px-3 py-3 font-medium">Qty ordered</th>
              {showCheckingResults ? (
                <>
                  <th className="px-3 py-3 font-medium">Qty received</th>
                  <th className="px-3 py-3 font-medium">Conform</th>
                </>
              ) : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 bg-white">
            {order.lines.map((line) => (
              <tr key={line.id}>
                <td className="whitespace-nowrap px-3 py-2 font-mono text-zinc-900">
                  {line.article.code}
                </td>
                <td className="px-3 py-2 text-zinc-900">
                  <div className="flex flex-wrap items-center gap-2">
                    <span>{line.article.name}</span>
                    {line.article.lowStock ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
                        Low stock
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-zinc-600">
                  {line.article.stock}
                </td>
                <td className="whitespace-nowrap px-3 py-2 font-medium text-zinc-900">
                  {line.qtyOrdered}
                </td>
                {showCheckingResults ? (
                  <>
                    <td className="whitespace-nowrap px-3 py-2 text-zinc-900">
                      {line.qtyReceivedActual ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">
                      {line.lineConform == null ? (
                        "—"
                      ) : line.lineConform ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-900">
                          V
                        </span>
                      ) : (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-900">
                          No
                        </span>
                      )}
                    </td>
                  </>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      ) : null}

      {showCheckingForm ? (
        <SupplierOrderCheckingSection
          order={order}
          onCompleted={(updated) => {
            setOrder(updated);
            setActionError(null);
          }}
        />
      ) : null}

      {showCloseForm ? (
        <SupplierOrderCloseSection
          order={order}
          onClosed={(updated) => {
            setOrder(updated);
            setActionError(null);
          }}
        />
      ) : null}

      {order.status === "PENDING" ? (
        <p className="mt-6 text-sm text-zinc-600">
          This order is waiting for delivery. Any team member can declare arrival
          when goods reach the warehouse.
          {canEditPending
            ? " Admins can still edit or cancel until then."
            : null}
        </p>
      ) : order.status === "ARRIVED_CHECKING" ? null : order.status === "CHECKED" ? (
        !canManage ? (
          <p className="mt-6 text-sm text-zinc-600">
            Checking is complete. An admin will close this order as succeeded or
            done with issues.
          </p>
        ) : null
      ) : order.status === "SUCCEEDED" ? (
        <p className="mt-6 text-sm text-zinc-600">
          Order closed successfully. Stock was loaded from the received
          quantities.
          {order.adminCloseNote ? (
            <>
              {" "}
              Note: {order.adminCloseNote}
            </>
          ) : null}
        </p>
      ) : order.status === "DONE" ? (
        <p className="mt-6 text-sm text-zinc-600">
          Order closed with reported issues. Stock was not loaded automatically.
          {order.adminCloseNote ? (
            <>
              {" "}
              Note: {order.adminCloseNote}
            </>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
