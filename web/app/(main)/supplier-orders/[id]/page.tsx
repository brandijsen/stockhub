import { SupplierOrderDetail } from "@/components/SupplierOrderDetail";
import { canManageSuppliers } from "@/lib/roles";
import { getSession } from "@/lib/session";

type SupplierOrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function SupplierOrderDetailPage({
  params,
}: SupplierOrderDetailPageProps) {
  const { id } = await params;
  const user = await getSession();
  const canManage = canManageSuppliers(user?.role);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <SupplierOrderDetail orderId={id} canManage={canManage} />
    </div>
  );
}
