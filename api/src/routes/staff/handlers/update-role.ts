import type { Request, Response } from "express";

import type { AuthenticatedRequest } from "../../../middleware/require-auth";
import { prisma } from "../../../lib/prisma";
import { updateStaffRoleSchema } from "../schemas";
import { serializeStaffUser } from "../serialize";

export async function updateStaffRole(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = req.params;
  const session = (req as AuthenticatedRequest).sessionUser;

  const parsed = updateStaffRoleSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten(),
    });
    return;
  }

  if (id === session.sub) {
    res.status(400).json({ error: "You cannot change your own role" });
    return;
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true },
    });

    if (!existing) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (existing.role === "SUPERADMIN") {
      res.status(403).json({ error: "Cannot change the super admin role" });
      return;
    }

    if (existing.role === parsed.data.role) {
      const user = await prisma.user.findUniqueOrThrow({
        where: { id },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          lastSeenAt: true,
        },
      });
      res.json({ user: serializeStaffUser(user) });
      return;
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role: parsed.data.role },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        lastSeenAt: true,
      },
    });

    res.json({ user: serializeStaffUser(user) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to update role" });
  }
}
