import { CustomersList } from "@/components/CustomersList";
import { PageContainer } from "@/components/PageContainer";
import { canManageAdminCatalog } from "@/lib/roles";
import { getSession } from "@/lib/session";

export default async function CustomersPage() {
  const user = await getSession();
  const canManage = canManageAdminCatalog(user?.role);

  return (
    <PageContainer>
      <CustomersList canManage={canManage} />
    </PageContainer>
  );
}
