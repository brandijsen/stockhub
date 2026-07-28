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

/** @deprecated Use `canManageAdminCatalog` — kept for call sites that refer to suppliers. */
export function canManageSuppliers(role: string | undefined | null): boolean {
  return canManageAdminCatalog(role);
}

/** @deprecated Use `canManageAdminCatalog` — kept for call sites that refer to customers. */
export function canManageCustomers(role: string | undefined | null): boolean {
  return canManageAdminCatalog(role);
}

/** Create customer sales orders (stock is unloaded on creation). */
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
