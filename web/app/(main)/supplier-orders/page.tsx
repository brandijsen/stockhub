import { PageContainer } from "@/components/PageContainer";
import { SupplierOrdersList } from "@/components/SupplierOrdersList";
import { canManageSupplierOrders } from "@/lib/roles";
import { getSession } from "@/lib/session";

export default async function SupplierOrdersPage() {
  const user = await getSession();
  const canManage = canManageSupplierOrders(user?.role);

  return (
    <PageContainer>
      <SupplierOrdersList canManage={canManage} />
    </PageContainer>
  );
}
