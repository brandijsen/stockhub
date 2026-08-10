import { CustomersList } from "@/components/CustomersList";
import { canManageAdminCatalog } from "@/lib/roles";
import { getSession } from "@/lib/session";

export default async function CustomersPage() {
  const user = await getSession();
  const canManage = canManageAdminCatalog(user?.role);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <CustomersList canManage={canManage} />
    </div>
  );
}
