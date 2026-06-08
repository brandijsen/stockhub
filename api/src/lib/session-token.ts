import { jwtVerify, SignJWT } from "jose";

/**
 * Stateless session JWT. Logout clears the cookie only — tokens remain valid until expiry.
 * Claims include `role` at issuance time; for ADMIN/SUPERADMIN-sensitive APIs reload role from
 * the database (see `getUserRoleFromDb`) instead of trusting the JWT alone.
 */
const COOKIE = "stockhub_session";
const TTL_DAYS = 30;

function getSecret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s?.trim()) {
    throw new Error("AUTH_SECRET is required");
  }
  return new TextEncoder().encode(s);
}

export async function signSessionToken(payload: {
  sub: string;
  email: string;
  name: string | null;
  role: string;
}): Promise<string> {
  return new SignJWT({
    email: payload.email,
    name: payload.name,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${TTL_DAYS}d`)
    .sign(getSecret());
}

export type SessionClaims = {
  sub: string;
  email: string;
  name: string | null;
  role: string;
};

export async function verifySessionToken(
  token: string,
): Promise<SessionClaims | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const sub = payload.sub;
    if (!sub || typeof payload.email !== "string") {
      return null;
    }
    return {
      sub,
      email: payload.email,
      name: typeof payload.name === "string" ? payload.name : null,
      role: typeof payload.role === "string" ? payload.role : "USER",
    };
  } catch {
    return null;
  }
}

export { COOKIE, TTL_DAYS };
