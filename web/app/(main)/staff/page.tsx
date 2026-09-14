import { PageContainer } from "@/components/PageContainer";
import { StaffList } from "@/components/StaffList";
import { getSession } from "@/lib/session";
import { canManageStaffRoles } from "@/lib/roles";

export default async function StaffPage() {
  const user = await getSession();
  const canManageRoles = canManageStaffRoles(user?.role);

  return (
    <PageContainer>
      <StaffList
        currentUserId={user?.id ?? ""}
        canManageRoles={canManageRoles}
      />
    </PageContainer>
  );
}
