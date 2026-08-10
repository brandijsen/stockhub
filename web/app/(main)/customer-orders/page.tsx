import { CustomerOrdersList } from "@/components/CustomerOrdersList";
import { canManageCustomerOrders } from "@/lib/roles";
import { getSession } from "@/lib/session";

export default async function CustomerOrdersPage() {
  const user = await getSession();
  const canManage = canManageCustomerOrders(user?.role);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <CustomerOrdersList canManage={canManage} />
    </div>
  );
}
