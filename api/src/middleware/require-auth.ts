import type { NextFunction, Request, Response } from "express";

import {
  COOKIE,
  type SessionClaims,
  verifySessionToken,
} from "../lib/session-token";

export type AuthenticatedRequest = Request & {
  sessionUser: SessionClaims;
};

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const token = req.cookies?.[COOKIE];
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const session = await verifySessionToken(token);
  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  (req as AuthenticatedRequest).sessionUser = session;
  next();
}
