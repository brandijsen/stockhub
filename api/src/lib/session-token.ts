import { SignJWT } from "jose";

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

export { COOKIE, TTL_DAYS };
