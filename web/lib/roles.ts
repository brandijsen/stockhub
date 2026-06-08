/** Roles that can create and edit catalog articles. Pass `user.role` from `getSession()` (DB-backed). */
export function canManageArticles(role: string | undefined | null): boolean {
  return role === "ADMIN" || role === "SUPERADMIN";
}
