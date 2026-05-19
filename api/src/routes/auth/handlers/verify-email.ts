import type { Request, Response } from "express";

import type { Prisma } from "@prisma/client";

import { prisma } from "../../../lib/prisma";
import { redirectLoginVerifyMsg } from "../../../lib/redirect-login";
import {
  frontendBase,
  setSessionCookieAndRedirectDashboard,
} from "../session";

/**
 * Verification via `GET ?token=` (link in email).
 *
 * Trade-off: the raw URL may be logged by proxies, appear in Referer, or stay in browser history.
 * Mitigations for stricter models: shorter TTL (`VERIFY_TTL_MINUTES`), HTTPS-only deploy,
 * or a future flow where GET shows a page that submits the token via POST (single-use).
 */

export async function verifyEmailGet(
  req: Request,
  res: Response,
): Promise<void> {
  const base = frontendBase();
  const token =
    typeof req.query.token === "string" ? req.query.token.trim() : "";
  if (!token) {
    res.redirect(`${base}/register/link-expired?invalid=1`);
    return;
  }

  try {
    const pending = await prisma.pendingRegistration.findUnique({
      where: { token },
    });

    if (!pending) {
      res.redirect(`${base}/register/link-expired?invalid=1`);
      return;
    }

    if (pending.expires < new Date()) {
      res.redirect(
        `${base}/register/link-expired?token=${encodeURIComponent(token)}`,
      );
      return;
    }

    try {
      const created = await prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {
          const user = await tx.user.create({
            data: {
              email: pending.email,
              password: pending.passwordHash,
              firstName: pending.firstName,
              lastName: pending.lastName,
              emailVerified: new Date(),
              role: "USER",
            },
          });
          await tx.pendingRegistration.delete({
            where: { token: pending.token },
          });
          return user;
        },
      );
      await setSessionCookieAndRedirectDashboard(res, created);
    } catch (e: unknown) {
      const isUniqueConflict =
        e &&
        typeof e === "object" &&
        "code" in e &&
        (e as { code?: string }).code === "P2002";

      if (isUniqueConflict) {
        await prisma.pendingRegistration
          .delete({ where: { token: pending.token } })
          .catch(() => undefined);
        const existing = await prisma.user.findUnique({
          where: { email: pending.email },
        });
        if (existing) {
          await setSessionCookieAndRedirectDashboard(res, existing);
          return;
        }
        res.redirect(`${base}/login?verified=1`);
        return;
      }
      console.error(e);
      redirectLoginVerifyMsg(
        res,
        base,
        "We could not complete verification. Try signing in, or register again.",
      );
    }
  } catch (e) {
    console.error(e);
    if (!res.headersSent) {
      redirectLoginVerifyMsg(
        res,
        base,
        "Something went wrong while verifying your email. Try again later.",
      );
    }
  }
}
