import { PageContainer } from "@/components/PageContainer";
import { SuppliersList } from "@/components/SuppliersList";
import { canManageAdminCatalog } from "@/lib/roles";
import { getSession } from "@/lib/session";

export default async function SuppliersPage() {
  const user = await getSession();
  const canManage = canManageAdminCatalog(user?.role);

  return (
    <PageContainer>
      <SuppliersList canManage={canManage} />
    </PageContainer>
  );
}
