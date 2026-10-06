/** Roles that can create and edit catalog articles. Pass `user.role` from `getSession()` (DB-backed). */
export function canManageArticles(role: string | undefined | null): boolean {
  return role === "ADMIN" || role === "SUPERADMIN";
}

/** Only the super admin can change staff roles. */
export function canManageStaffRoles(role: string | undefined | null): boolean {
  return role === "SUPERADMIN";
}

/** Admin-only catalog resources (suppliers, customers, …). */
export function canManageAdminCatalog(role: string | undefined | null): boolean {
  return role === "ADMIN" || role === "SUPERADMIN";
}

/** Create, edit, and cancel customer sales orders before pickup. */
export function canManageCustomerOrders(
  role: string | undefined | null,
): boolean {
  return canManageAdminCatalog(role);
}

/** Create, edit, delete, and close supplier purchase orders. */
export function canManageSupplierOrders(
  role: string | undefined | null,
): boolean {
  return canManageAdminCatalog(role);
}
