import { SuppliersList } from "@/components/SuppliersList";
import { canManageAdminCatalog } from "@/lib/roles";
import { getSession } from "@/lib/session";

export default async function SuppliersPage() {
  const user = await getSession();
  const canManage = canManageAdminCatalog(user?.role);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <SuppliersList canManage={canManage} />
    </div>
  );
}
