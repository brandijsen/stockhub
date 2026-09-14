import { redirect } from "next/navigation";

import { PageContainer, pageTitleClassName } from "@/components/PageContainer";
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
    <PageContainer width="narrow">
      <h1 className={pageTitleClassName}>Edit supplier order</h1>
      <p className="mt-1 text-zinc-600">
        Update lines or supplier while the order is still pending.
      </p>
      <div className="mt-8">
        <SupplierOrderEditView orderId={id} />
      </div>
    </PageContainer>
  );
}
