import type { Request, Response } from "express";

import { prisma } from "../../../lib/prisma";
import { serializeStaffUser } from "../serialize";

export async function listStaff(_req: Request, res: Response): Promise<void> {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        lastSeenAt: true,
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }, { email: "asc" }],
    });

    res.json({ users: users.map(serializeStaffUser) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load staff" });
  }
}
