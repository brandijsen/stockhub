import type { NextFunction, Request, Response } from "express";

import { getUserRoleFromDb } from "../lib/db-user-role";
import type { AuthenticatedRequest } from "./require-auth";

export async function requireSuperAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const session = (req as AuthenticatedRequest).sessionUser;
  if (!session?.sub) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const role = await getUserRoleFromDb(session.sub);
  if (role !== "SUPERADMIN") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  next();
}
