import { jwtVerify } from "jose";
import { cookies } from "next/headers";

/** Same name as Express `api/src/lib/session-token.ts` */
export const SESSION_COOKIE = "stockhub_session";

export type AppSessionUser = {
  id: string;
  email: string;
  name: string | null;
  /** From JWT at login — may lag DB if role changed server-side; privileged APIs should read DB. */
  role: string;
};

export async function getSession(): Promise<AppSessionUser | null> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    return null;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
    );
    const sub = payload.sub;
    if (!sub || typeof payload.email !== "string") {
      return null;
    }
    return {
      id: sub,
      email: payload.email,
      name: typeof payload.name === "string" ? payload.name : null,
      role: typeof payload.role === "string" ? payload.role : "USER",
    };
  } catch {
    return null;
  }
}
