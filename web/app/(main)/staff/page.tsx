import { StaffList } from "@/components/StaffList";
import { getSession } from "@/lib/session";
import { canManageStaffRoles } from "@/lib/roles";

export default async function StaffPage() {
  const user = await getSession();
  const canManageRoles = canManageStaffRoles(user?.role);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <StaffList
        currentUserId={user?.id ?? ""}
        canManageRoles={canManageRoles}
      />
    </div>
  );
}
