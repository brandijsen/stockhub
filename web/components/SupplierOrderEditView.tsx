"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { SupplierOrderForm } from "@/components/SupplierOrderForm";
import { Spinner } from "@/components/Spinner";
import { apiErrorMessage } from "@/lib/api-client";
import { fetchSupplierOrder, type SupplierOrder } from "@/lib/supplier-orders";

type SupplierOrderEditViewProps = {
  orderId: string;
};

export function SupplierOrderEditView({ orderId }: SupplierOrderEditViewProps) {
  const [order, setOrder] = useState<SupplierOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchSupplierOrder(orderId);
        if (!cancelled) {
          if (data.status !== "PENDING") {
            setError("Only pending orders can be edited.");
            setOrder(null);
          } else {
            setOrder(data);
          }
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
          href={`/supplier-orders/${orderId}`}
          className="mt-4 inline-block text-sm font-medium text-sky-700 hover:text-sky-900"
        >
          ← Back to order
        </Link>
      </div>
    );
  }

  return <SupplierOrderForm order={order} />;
}
