import { Suspense } from "react";

import { CustomerOrdersList } from "@/components/CustomerOrdersList";
import { Spinner } from "@/components/Spinner";
import { canManageCustomerOrders } from "@/lib/roles";
import { getSession } from "@/lib/session";

export default async function CustomerOrdersPage() {
  const user = await getSession();
  const canManage = canManageCustomerOrders(user?.role);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Suspense
        fallback={
          <div className="flex items-center gap-2 text-zinc-600">
            <Spinner label="Loading customer orders" />
            <span>Loading customer orders…</span>
          </div>
        }
      >
        <CustomerOrdersList canManage={canManage} />
      </Suspense>
    </div>
  );
}
