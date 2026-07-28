import { redirect } from "next/navigation";

import { CustomerOrderForm } from "@/components/CustomerOrderForm";
import { canManageCustomerOrders } from "@/lib/roles";
import { getSession } from "@/lib/session";

export default async function NewCustomerOrderPage() {
  const user = await getSession();
  if (!canManageCustomerOrders(user?.role)) {
    redirect("/customer-orders");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-zinc-900">New customer order</h1>
      <p className="mt-1 text-zinc-600">
        Creates an open order and unloads stock from the selected articles
        immediately.
      </p>
      <div className="mt-8">
        <CustomerOrderForm />
      </div>
    </div>
  );
}
