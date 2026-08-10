import { SupplierOrdersList } from "@/components/SupplierOrdersList";
import { canManageSupplierOrders } from "@/lib/roles";
import { getSession } from "@/lib/session";

export default async function SupplierOrdersPage() {
  const user = await getSession();
  const canManage = canManageSupplierOrders(user?.role);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <SupplierOrdersList canManage={canManage} />
    </div>
  );
}
