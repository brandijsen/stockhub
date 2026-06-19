import { api } from "@/lib/api-client";
import { staffRoleLabel } from "@/lib/staff";

export type ProfileUser = {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  role: string;
  imageUrl: string | null;
  emailVerified: string;
  createdAt: string;
};

export type ProfileResponse = {
  user: ProfileUser;
};

export async function fetchProfile(): Promise<ProfileUser> {
  const { data } = await api.get<ProfileResponse>("/api/profile");
  return data.user;
}

export async function updateProfile(
  input: Pick<ProfileUser, "firstName" | "lastName">,
): Promise<ProfileUser> {
  const { data } = await api.patch<ProfileResponse>("/api/profile", input);
  return data.user;
}

export async function uploadProfileImage(file: File): Promise<ProfileUser> {
  const form = new FormData();
  form.append("image", file);
  const { data } = await api.post<ProfileResponse>("/api/profile/image", form);
  return data.user;
}

export async function removeProfileImage(): Promise<ProfileUser> {
  const { data } = await api.delete<ProfileResponse>("/api/profile/image");
  return data.user;
}

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

export async function changeProfilePassword(
  input: ChangePasswordInput,
): Promise<void> {
  await api.patch("/api/profile/password", input);
}

export { staffRoleLabel as profileRoleLabel };

export function profileInitials(user: Pick<ProfileUser, "firstName" | "lastName">): string {
  const first = user.firstName.trim().charAt(0);
  const last = user.lastName.trim().charAt(0);
  const initials = `${first}${last}`.toUpperCase();
  return initials || "?";
}

export function formatMemberSince(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}
