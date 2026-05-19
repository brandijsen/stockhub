import type { Response } from "express";

import { COOKIE, signSessionToken, TTL_DAYS } from "../../lib/session-token";

export function frontendBase(): string {
  return (
    process.env.FRONTEND_URL?.replace(/\/$/, "") || "http://localhost:3000"
  );
}

export function displayName(user: {
  firstName: string;
  lastName: string;
}): string {
  return `${user.firstName} ${user.lastName}`.trim();
}

export function cookieOpts() {
  const prod = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    path: "/",
    secure: prod,
    sameSite: "lax" as const,
    maxAge: TTL_DAYS * 24 * 60 * 60,
  };
}

export async function setSessionCookieAndRedirectDashboard(
  res: Response,
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  },
): Promise<void> {
  const sessionTok = await signSessionToken({
    sub: user.id,
    email: user.email,
    name: displayName(user),
    role: user.role,
  });
  res.cookie(COOKIE, sessionTok, cookieOpts());
  res.redirect(`${frontendBase()}/dashboard`);
}
