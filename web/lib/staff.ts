import { api } from "@/lib/api-client";

export type StaffUser = {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  role: string;
  lastSeenAt: string | null;
  online: boolean;
};

export type StaffListResponse = {
  users: StaffUser[];
};

export function staffRoleLabel(role: string): string {
  switch (role) {
    case "SUPERADMIN":
      return "Super admin";
    case "ADMIN":
      return "Admin";
    case "USER":
      return "User";
    default:
      return role;
  }
}

export function staffStatusLabel(online: boolean): string {
  return online ? "Online" : "Offline";
}

export type UpdateStaffRoleResponse = {
  user: StaffUser;
};

export type StaffAssignableRole = "USER" | "ADMIN";

export async function updateStaffRole(
  userId: string,
  role: StaffAssignableRole,
): Promise<StaffUser> {
  const { data } = await api.patch<UpdateStaffRoleResponse>(
    `/api/staff/${userId}/role`,
    { role },
  );
  return data.user;
}
