import type { Request, Response } from "express";

import { COOKIE } from "../../../lib/session-token";
import { cookieClearOpts } from "../session";

export function logoutPost(_req: Request, res: Response): void {
  res.clearCookie(COOKIE, cookieClearOpts());
  res.json({ ok: true });
}
