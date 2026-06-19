import type { Request, Response } from "express";

import type { AuthenticatedRequest } from "../../../middleware/require-auth";
import { prisma } from "../../../lib/prisma";
import { updateProfileSchema } from "../schemas";
import { serializeProfileUser } from "../serialize";
import { profileUserSelect } from "../user-select";

export async function updateProfile(
  req: Request,
  res: Response,
): Promise<void> {
  const { sub: userId } = (req as AuthenticatedRequest).sessionUser;
  const parsed = updateProfileSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten(),
    });
    return;
  }

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
      },
      select: profileUserSelect,
    });

    res.json({ user: serializeProfileUser(user) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to update profile" });
  }
}
