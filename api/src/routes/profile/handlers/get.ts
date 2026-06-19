import type { Request, Response } from "express";

import type { AuthenticatedRequest } from "../../../middleware/require-auth";
import { prisma } from "../../../lib/prisma";
import { serializeProfileUser } from "../serialize";
import { profileUserSelect } from "../user-select";

export async function getProfile(req: Request, res: Response): Promise<void> {
  const { sub: userId } = (req as AuthenticatedRequest).sessionUser;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: profileUserSelect,
    });

    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    res.json({ user: serializeProfileUser(user) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load profile" });
  }
}
