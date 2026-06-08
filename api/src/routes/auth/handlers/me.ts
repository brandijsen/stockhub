import type { Request, Response } from "express";

import { prisma } from "../../../lib/prisma";
import type { AuthenticatedRequest } from "../../../middleware/require-auth";
import { displayName } from "../session";

export async function meGet(req: Request, res: Response): Promise<void> {
  const session = (req as AuthenticatedRequest).sessionUser;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.sub },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: displayName(user),
        role: user.role,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load session user" });
  }
}
