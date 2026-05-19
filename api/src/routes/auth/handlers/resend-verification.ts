import type { Request, Response } from "express";

import { prisma } from "../../../lib/prisma";
import { rotatePendingTokenAndDispatchEmail } from "../pending-verification-dispatch";
import { resendVerificationSchema } from "../schemas";

export async function resendVerificationPost(
  req: Request,
  res: Response,
): Promise<void> {
  const parsed = resendVerificationSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten(),
    });
    return;
  }

  const oldToken = parsed.data.token.trim();

  try {
    const pending = await prisma.pendingRegistration.findUnique({
      where: { token: oldToken },
    });

    if (!pending) {
      res.status(404).json({
        error:
          "This verification link is no longer valid. Please register again.",
      });
      return;
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: pending.email },
      select: { id: true },
    });

    if (existingUser) {
      res.status(200).json({
        ok: true,
        alreadyVerified: true as const,
        message:
          "This email already has a verified account. You can sign in with your password.",
      });
      return;
    }

    const result = await rotatePendingTokenAndDispatchEmail(pending);
    if (!result.ok) {
      res.status(result.httpStatus).json({ error: result.error });
      return;
    }

    const updated = await prisma.pendingRegistration.findUnique({
      where: { email: pending.email },
      select: { token: true },
    });

    if (!updated) {
      res.status(500).json({ error: "Could not resend verification email" });
      return;
    }

    res.status(200).json({
      ok: true,
      email: pending.email,
      resendToken: updated.token,
      message:
        "A new verification link has been sent. Check your inbox and spam folder.",
      ...(process.env.NODE_ENV === "development"
        ? { verifyUrl: result.verifyUrl, _devOnly: true as const }
        : {}),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not resend verification email" });
  }
}
