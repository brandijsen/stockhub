import { Suspense } from "react";

import { SupplierOrdersList } from "@/components/SupplierOrdersList";
import { Spinner } from "@/components/Spinner";
import { canManageSupplierOrders } from "@/lib/roles";
import { getSession } from "@/lib/session";

export default async function SupplierOrdersPage() {
  const user = await getSession();
  const canManage = canManageSupplierOrders(user?.role);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Suspense
        fallback={
          <div className="flex items-center gap-2 text-zinc-600">
            <Spinner label="Loading supplier orders" />
            <span>Loading supplier orders…</span>
          </div>
        }
      >
        <SupplierOrdersList canManage={canManage} />
      </Suspense>
    </div>
  );
}
