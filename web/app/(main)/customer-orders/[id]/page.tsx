import { CustomerOrderDetail } from "@/components/CustomerOrderDetail";
import { PageContainer } from "@/components/PageContainer";
import { canManageCustomerOrders } from "@/lib/roles";
import { getSession } from "@/lib/session";

type CustomerOrderPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CustomerOrderPage({
  params,
}: CustomerOrderPageProps) {
  const { id } = await params;
  const user = await getSession();
  const canManage = canManageCustomerOrders(user?.role);

  return (
    <PageContainer>
      <CustomerOrderDetail orderId={id} canManage={canManage} />
    </PageContainer>
  );
}
