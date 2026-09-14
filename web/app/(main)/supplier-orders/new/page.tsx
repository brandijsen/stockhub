import { redirect } from "next/navigation";

import { PageContainer, pageTitleClassName } from "@/components/PageContainer";
import { SupplierOrderForm } from "@/components/SupplierOrderForm";
import { canManageSupplierOrders } from "@/lib/roles";
import { getSession } from "@/lib/session";

export default async function NewSupplierOrderPage() {
  const user = await getSession();
  if (!canManageSupplierOrders(user?.role)) {
    redirect("/supplier-orders");
  }

  return (
    <PageContainer width="narrow">
      <h1 className={pageTitleClassName}>New supplier order</h1>
      <p className="mt-1 text-zinc-600">
        Creates a pending purchase order for the selected supplier.
      </p>
      <div className="mt-8">
        <SupplierOrderForm />
      </div>
    </PageContainer>
  );
}
