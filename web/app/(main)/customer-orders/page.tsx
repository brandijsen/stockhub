import { CustomerOrdersList } from "@/components/CustomerOrdersList";
import { PageContainer } from "@/components/PageContainer";
import { canManageCustomerOrders } from "@/lib/roles";
import { getSession } from "@/lib/session";

export default async function CustomerOrdersPage() {
  const user = await getSession();
  const canManage = canManageCustomerOrders(user?.role);

  return (
    <PageContainer>
      <CustomerOrdersList canManage={canManage} />
    </PageContainer>
  );
}
