import { hash } from "bcryptjs";
import { randomBytes } from "crypto";
import type { Request, Response } from "express";

import { prisma } from "../../../lib/prisma";
import { isMailConfigured, sendVerificationEmail } from "../../../lib/mail";
import { verificationUrlForToken } from "../pending-verification-dispatch";
import { verifyTtlMinutes } from "../../../env";
import { registerSchema } from "../schemas";

export async function registerPost(req: Request, res: Response): Promise<void> {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten(),
    });
    return;
  }

  const email = parsed.data.email.trim().toLowerCase();
  const passwordHash = await hash(parsed.data.password, 12);
  const firstName = parsed.data.firstName.trim();
  const lastName = parsed.data.lastName.trim();

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      res
        .status(409)
        .json({ error: "An account with this email already exists" });
      return;
    }

    const pending = await prisma.pendingRegistration.findUnique({
      where: { email },
      select: { expires: true },
    });

    if (pending) {
      const now = new Date();
      if (pending.expires >= now) {
        res.status(409).json({
          error:
            "A signup for this email is already in progress. Check your inbox or sign in with your password to continue.",
        });
        return;
      }
      await prisma.pendingRegistration
        .delete({ where: { email } })
        .catch(() => undefined);
    }

    const verifyToken = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + verifyTtlMinutes() * 60 * 1000);

    await prisma.pendingRegistration.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        token: verifyToken,
        expires,
      },
    });

    const verifyUrl = verificationUrlForToken(verifyToken);

    const prod = process.env.NODE_ENV === "production";

    if (isMailConfigured()) {
      const sent = await sendVerificationEmail(email, verifyUrl);
      if (!sent.ok) {
        await prisma.pendingRegistration
          .delete({ where: { email } })
          .catch(() => undefined);
        console.error("[mail] verification email failed:", sent.message);
        res.status(500).json({
          error:
            "Could not send verification email. Try again in a few minutes.",
        });
        return;
      }
    } else if (prod) {
      await prisma.pendingRegistration
        .delete({ where: { email } })
        .catch(() => undefined);
      res.status(503).json({
        error:
          "Email delivery is not configured. Set BREVO_API_KEY and EMAIL_FROM (or RESEND_API_KEY) on the server.",
      });
      return;
    }

    res.status(201).json({
      ok: true,
      message:
        "Check your email and open the verification link to complete registration. Until then you do not have an account and cannot sign in.",
      ...(process.env.NODE_ENV === "development"
        ? { verifyUrl, _devOnly: true as const }
        : {}),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not start registration" });
  }
}
