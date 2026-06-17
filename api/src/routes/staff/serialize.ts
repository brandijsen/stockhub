import type { UserRole } from "@prisma/client";

import { isUserOnline } from "../../lib/user-presence";

type StaffUserRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  lastSeenAt: Date | null;
};

export function serializeStaffUser(user: StaffUserRow) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    name: `${user.firstName} ${user.lastName}`.trim(),
    email: user.email,
    role: user.role,
    lastSeenAt: user.lastSeenAt?.toISOString() ?? null,
    online: isUserOnline(user.lastSeenAt),
  };
}

export type SerializedStaffUser = ReturnType<typeof serializeStaffUser>;
