import { randomBytes } from "crypto";

import { prisma } from "../../lib/prisma";
import { isMailConfigured, sendVerificationEmail } from "../../lib/mail";
import { verifyTtlMinutes } from "../../env";
import { frontendBase } from "./session";

export function verificationUrlForToken(token: string): string {
  const verifyPath = `/api/auth/verify-email?token=${encodeURIComponent(token)}`;
  return `${frontendBase()}${verifyPath}`;
}

export type RotatePendingEmailResult =
  | { ok: true; verifyUrl: string }
  | { ok: false; error: string; httpStatus: number };

/** Rotates token + expiry, sends verification email; rolls back row on send/config failure. */
export async function rotatePendingTokenAndDispatchEmail(pending: {
  id: string;
  email: string;
  token: string;
  expires: Date;
}): Promise<RotatePendingEmailResult> {
  const prevToken = pending.token;
  const prevExpires = pending.expires;

  const newToken = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + verifyTtlMinutes() * 60 * 1000);

  await prisma.pendingRegistration.update({
    where: { id: pending.id },
    data: { token: newToken, expires },
  });

  const verifyUrl = verificationUrlForToken(newToken);
  const prod = process.env.NODE_ENV === "production";

  if (isMailConfigured()) {
    const sent = await sendVerificationEmail(pending.email, verifyUrl);
    if (!sent.ok) {
      console.error("[mail] verification email failed:", sent.message);
      await prisma.pendingRegistration
        .update({
          where: { id: pending.id },
          data: { token: prevToken, expires: prevExpires },
        })
        .catch(() => undefined);
      return {
        ok: false,
        error:
          "Could not send verification email. Try again in a few minutes.",
        httpStatus: 500,
      };
    }
  } else if (prod) {
    await prisma.pendingRegistration
      .update({
        where: { id: pending.id },
        data: { token: prevToken, expires: prevExpires },
      })
      .catch(() => undefined);
    return {
      ok: false,
      error:
        "Email delivery is not configured. Set BREVO_API_KEY and EMAIL_FROM (or RESEND_API_KEY) on the server.",
      httpStatus: 503,
    };
  }

  return { ok: true, verifyUrl };
}
