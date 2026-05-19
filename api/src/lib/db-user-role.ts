import type { UserRole } from "@prisma/client";

import { prisma } from "./prisma";

/**
 * Current role from the database for `userId`.
 * Use on privileged API routes instead of trusting only the JWT `role` claim —
 * the cookie may have been issued before a promotion/demotion.
 */
export async function getUserRoleFromDb(
  userId: string,
): Promise<UserRole | null> {
  const row = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return row?.role ?? null;
}
