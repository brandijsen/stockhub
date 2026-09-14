import { PageContainer } from "@/components/PageContainer";
import { SupplierOrderDetail } from "@/components/SupplierOrderDetail";
import { canManageSupplierOrders } from "@/lib/roles";
import { getSession } from "@/lib/session";

type SupplierOrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function SupplierOrderDetailPage({
  params,
}: SupplierOrderDetailPageProps) {
  const { id } = await params;
  const user = await getSession();
  const canManage = canManageSupplierOrders(user?.role);

  return (
    <PageContainer width="detail">
      <SupplierOrderDetail orderId={id} canManage={canManage} />
    </PageContainer>
  );
}
