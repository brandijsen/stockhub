import type { Response } from "express";

/** Browser-friendly UX: send users to Next login with a readable verification message (query). */
export function redirectLoginVerifyMsg(
  res: Response,
  frontendOrigin: string,
  message: string,
): void {
  const base = frontendOrigin.replace(/\/$/, "");
  const url = `${base}/login?verifyMsg=${encodeURIComponent(message)}`;
  res.redirect(302, url);
}
