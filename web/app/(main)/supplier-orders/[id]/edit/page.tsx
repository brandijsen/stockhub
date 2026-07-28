import { redirect } from "next/navigation";

import { SupplierOrderEditView } from "@/components/SupplierOrderEditView";
import { canManageSupplierOrders } from "@/lib/roles";
import { getSession } from "@/lib/session";

type EditSupplierOrderPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditSupplierOrderPage({
  params,
}: EditSupplierOrderPageProps) {
  const user = await getSession();
  if (!canManageSupplierOrders(user?.role)) {
    redirect("/supplier-orders");
  }

  const { id } = await params;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-zinc-900">Edit supplier order</h1>
      <p className="mt-1 text-zinc-600">
        Update lines or supplier while the order is still pending. The supplier
        receives an updated email when mail is configured.
      </p>
      <div className="mt-8">
        <SupplierOrderEditView orderId={id} />
      </div>
    </div>
  );
}
