import type { UserRole } from "@prisma/client";

import { resolveProfileImageUrl } from "../../lib/user-image";
import { displayName } from "../auth/session";

type ProfileUserRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  image: string | null;
  emailVerified: Date;
  createdAt: Date;
};

export function serializeProfileUser(user: ProfileUserRow) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    name: displayName(user),
    email: user.email,
    role: user.role,
    imageUrl: resolveProfileImageUrl(user.image),
    emailVerified: user.emailVerified.toISOString(),
    createdAt: user.createdAt.toISOString(),
  };
}

export type SerializedProfileUser = ReturnType<typeof serializeProfileUser>;
