import { redirect } from "next/navigation";

import { CustomerOrderEditView } from "@/components/CustomerOrderEditView";
import { PageContainer, pageTitleClassName } from "@/components/PageContainer";
import { canManageCustomerOrders } from "@/lib/roles";
import { getSession } from "@/lib/session";

type EditCustomerOrderPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditCustomerOrderPage({
  params,
}: EditCustomerOrderPageProps) {
  const user = await getSession();
  if (!canManageCustomerOrders(user?.role)) {
    redirect("/customer-orders");
  }

  const { id } = await params;

  return (
    <PageContainer width="narrow">
      <h1 className={pageTitleClassName}>Edit customer order</h1>
      <p className="mt-1 text-zinc-600">
        Change the customer or the lines while the order is still open. Added
        units are unloaded, and removed units go back into stock.
      </p>
      <div className="mt-8">
        <CustomerOrderEditView orderId={id} />
      </div>
    </PageContainer>
  );
}
