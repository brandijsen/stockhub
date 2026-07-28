import { redirect } from "next/navigation";

import { SupplierOrderForm } from "@/components/SupplierOrderForm";
import { canManageSupplierOrders } from "@/lib/roles";
import { getSession } from "@/lib/session";

export default async function NewSupplierOrderPage() {
  const user = await getSession();
  if (!canManageSupplierOrders(user?.role)) {
    redirect("/supplier-orders");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-zinc-900">
        New supplier order
      </h1>
      <p className="mt-1 text-zinc-600">
        Creates a pending order and sends a notification email to the supplier
        when mail is configured.
      </p>
      <div className="mt-8">
        <SupplierOrderForm />
      </div>
    </div>
  );
}
