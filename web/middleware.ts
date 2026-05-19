import { jwtVerify } from "jose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { SESSION_COOKIE } from "@/lib/session";

async function getSessionPayload(request: NextRequest) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    return null;
  }
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
    );
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await getSessionPayload(request);
  const isLoggedIn = !!session?.sub;

  if (
    isLoggedIn &&
    (pathname.startsWith("/login") || pathname.startsWith("/register"))
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.nextUrl.origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
