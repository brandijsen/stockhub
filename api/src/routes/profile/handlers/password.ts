import { compare, hash } from "bcryptjs";
import type { Request, Response } from "express";

import type { AuthenticatedRequest } from "../../../middleware/require-auth";
import { prisma } from "../../../lib/prisma";
import { changePasswordSchema } from "../schemas";

export async function changePassword(
  req: Request,
  res: Response,
): Promise<void> {
  const { sub: userId } = (req as AuthenticatedRequest).sessionUser;
  const parsed = changePasswordSchema.safeParse(req.body);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    res.status(400).json({
      error: firstIssue?.message ?? "Validation failed",
      details: parsed.error.flatten(),
    });
    return;
  }

  const { currentPassword, newPassword } = parsed.data;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user?.password) {
      res.status(400).json({
        error: "Password change is not available for this account",
      });
      return;
    }

    const valid = await compare(currentPassword, user.password);
    if (!valid) {
      res.status(400).json({ error: "Current password is incorrect" });
      return;
    }

    const sameAsCurrent = await compare(newPassword, user.password);
    if (sameAsCurrent) {
      res.status(400).json({
        error: "New password must be different from the current password",
      });
      return;
    }

    const passwordHash = await hash(newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { password: passwordHash },
    });

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to change password" });
  }
}
