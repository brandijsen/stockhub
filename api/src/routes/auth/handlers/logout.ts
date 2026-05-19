import type { Request, Response } from "express";

import { COOKIE } from "../../../lib/session-token";

export function logoutPost(_req: Request, res: Response): void {
  res.clearCookie(COOKIE, { path: "/" });
  res.json({ ok: true });
}
