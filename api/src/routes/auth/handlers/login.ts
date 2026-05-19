import { compare } from "bcryptjs";
import type { Request, Response } from "express";

import { prisma } from "../../../lib/prisma";
import { COOKIE, signSessionToken } from "../../../lib/session-token";
import { cookieOpts, displayName } from "../session";
import { loginSchema } from "../schemas";

export async function loginPost(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten(),
    });
    return;
  }

  const email = parsed.data.email.trim().toLowerCase();
  const password = parsed.data.password;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user?.password) {
      const pending = await prisma.pendingRegistration.findUnique({
        where: { email },
      });
      if (pending) {
        const passwordOk = await compare(password, pending.passwordHash);
        if (!passwordOk) {
          res.status(401).json({
            error: "Invalid email or password",
          });
          return;
        }

        res.status(403).json({
          code: "PENDING_VERIFICATION",
          resendToken: pending.token,
        });
        return;
      }
      res.status(401).json({
        error: "Invalid email or password",
      });
      return;
    }

    const valid = await compare(password, user.password);
    if (!valid) {
      res.status(401).json({
        error: "Invalid email or password",
      });
      return;
    }

    const token = await signSessionToken({
      sub: user.id,
      email: user.email,
      name: displayName(user),
      role: user.role,
    });

    res.cookie(COOKIE, token, cookieOpts());
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Sign-in failed" });
  }
}
