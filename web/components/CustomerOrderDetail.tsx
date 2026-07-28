"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Spinner } from "@/components/Spinner";
import { apiErrorMessage } from "@/lib/api-client";
import {
  confirmCustomerOrderPickup,
  customerOrderStatusLabel,
  fetchCustomerOrder,
  formatCustomerOrderDate,
  type CustomerOrder,
} from "@/lib/customer-orders";

type CustomerOrderDetailProps = {
  orderId: string;
};

export function CustomerOrderDetail({ orderId }: CustomerOrderDetailProps) {
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
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

    const confirmed = window.confirm(
      "Confirm that the customer has picked up this order?",
    );
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

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-zinc-600">
        <Spinner label="Loading customer order" />
        <span>Loading order…</span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        {error ?? "Customer order not found"}
      </p>
    );
  }

  return (
    <div>
      <Link
        href="/customer-orders"
        className="text-sm font-medium text-sky-700 hover:text-sky-900"
      >
        ← Back to customer orders
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">
            Order for {order.customer.name}
          </h1>
          <p className="mt-1 text-zinc-600">
            Status:{" "}
            <span className="font-medium text-zinc-800">
              {customerOrderStatusLabel(order.status)}
            </span>
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            Created {formatCustomerOrderDate(order.createdAt)} by{" "}
            {order.createdBy.name}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50/60 p-4 text-sm text-zinc-700">
        <p className="font-medium text-zinc-900">{order.customer.name}</p>
        <p>{order.customer.email}</p>
        {order.customer.phone ? <p>{order.customer.phone}</p> : null}
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-zinc-200">
        <table className="min-w-full divide-y divide-zinc-200 text-sm">
          <thead className="bg-zinc-50 text-left text-zinc-600">
            <tr>
              <th className="px-3 py-3 font-medium">Code</th>
              <th className="px-3 py-3 font-medium">Article</th>
              <th className="px-3 py-3 font-medium">Qty</th>
              <th className="px-3 py-3 font-medium">Current stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 bg-white">
            {order.lines.map((line) => (
              <tr key={line.id}>
                <td className="px-3 py-2 font-medium text-zinc-900">
                  {line.article.code}
                </td>
                <td className="px-3 py-2 text-zinc-600">{line.article.name}</td>
                <td className="px-3 py-2 text-zinc-600">{line.quantity}</td>
                <td className="px-3 py-2 text-zinc-600">{line.article.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {actionError ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {actionError}
        </p>
      ) : null}

      {order.status === "OPEN" ? (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-950">
            Stock was unloaded when this order was created. Confirm pickup when
            the customer collects the goods — no further stock change.
          </p>
          <button
            type="button"
            disabled={confirming}
            onClick={() => void handleConfirmPickup()}
            className="mt-3 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {confirming ? (
              <span className="inline-flex items-center gap-2">
                <Spinner className="h-4 w-4" />
                Confirming…
              </span>
            ) : (
              "Confirm pickup"
            )}
          </button>
        </div>
      ) : (
        <p className="mt-6 text-sm text-zinc-600">
          Pickup confirmed. This order is complete.
        </p>
      )}
    </div>
  );
}
