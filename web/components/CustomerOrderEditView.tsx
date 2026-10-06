"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { CustomerOrderForm } from "@/components/CustomerOrderForm";
import { LoadingText } from "@/components/ContentSkeletons";
import { apiErrorMessage } from "@/lib/api-client";
import { fetchCustomerOrder, type CustomerOrder } from "@/lib/customer-orders";

type CustomerOrderEditViewProps = {
  orderId: string;
};

export function CustomerOrderEditView({ orderId }: CustomerOrderEditViewProps) {
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchCustomerOrder(orderId);
        if (!cancelled) {
          if (data.status !== "OPEN") {
            setError("Only open orders can be edited.");
            setOrder(null);
          } else {
            setOrder(data);
          }
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

  if (loading && !order) {
    return <LoadingText className="mt-6" />;
  }

  if (error || !order) {
    return (
      <div>
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error ?? "Customer order not found"}
        </p>
        <Link
          href={`/customer-orders/${orderId}`}
          className="mt-4 inline-block text-sm font-medium text-sky-700 hover:text-sky-900"
        >
          ← Back to order
        </Link>
      </div>
    );
  }

  return <CustomerOrderForm order={order} />;
}
