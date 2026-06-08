import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { cache } from "react";

/** Same name as Express `api/src/lib/session-token.ts` */
export const SESSION_COOKIE = "stockhub_session";

export type AppSessionUser = {
  id: string;
  email: string;
  name: string | null;
  /** Current role from the database (via GET /api/auth/me), not the JWT claim alone. */
  role: string;
};

type MeResponse = {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
  };
};

async function fetchSessionUserFromApi(
  sessionToken: string,
): Promise<MeResponse["user"] | "unauthorized" | null> {
  const apiUrl = process.env.API_URL || "http://localhost:4000";

  try {
    const res = await fetch(`${apiUrl}/api/auth/me`, {
      headers: {
        Cookie: `${SESSION_COOKIE}=${sessionToken}`,
      },
      cache: "no-store",
    });

    if (res.status === 401) {
      return "unauthorized";
    }

    if (!res.ok) {
      return null;
    }

    const data = (await res.json()) as MeResponse;
    return data.user;
  } catch {
    return null;
  }
}

export const getSession = cache(async (): Promise<AppSessionUser | null> => {
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

    const jwtUser: AppSessionUser = {
      id: sub,
      email: payload.email,
      name: typeof payload.name === "string" ? payload.name : null,
      role: typeof payload.role === "string" ? payload.role : "USER",
    };

    const dbUser = await fetchSessionUserFromApi(token);
    if (dbUser === "unauthorized") {
      return null;
    }

    if (dbUser) {
      return {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role,
      };
    }

    // API unreachable or errored — fail closed for privileged UI gates.
    return { ...jwtUser, role: "USER" };
  } catch {
    return null;
  }
});
