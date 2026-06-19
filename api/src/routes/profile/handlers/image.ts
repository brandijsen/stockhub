import path from "node:path";

import type { Request, Response } from "express";

import type { AuthenticatedRequest } from "../../../middleware/require-auth";
import {
  contentTypeForStorageKey,
  deleteUserImageFile,
  resolveStoredImagePath,
  saveUserImageFile,
} from "../../../lib/user-image";
import { prisma } from "../../../lib/prisma";
import { serializeProfileUser } from "../serialize";
import { profileUserSelect } from "../user-select";

export async function uploadProfileImage(
  req: Request,
  res: Response,
): Promise<void> {
  const { sub: userId } = (req as AuthenticatedRequest).sessionUser;
  const file = req.file;

  if (!file) {
    res.status(400).json({ error: "Image file is required" });
    return;
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { id: userId },
      select: { image: true },
    });

    if (!existing) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const storageKey = await saveUserImageFile(
      userId,
      file.buffer,
      file.mimetype,
    );

    const user = await prisma.user.update({
      where: { id: userId },
      data: { image: storageKey },
      select: profileUserSelect,
    });

    res.json({ user: serializeProfileUser(user) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to upload profile image" });
  }
}

export async function getProfileImage(
  req: Request,
  res: Response,
): Promise<void> {
  const { sub: userId } = (req as AuthenticatedRequest).sessionUser;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { image: true },
    });

    if (!user?.image || user.image.startsWith("http")) {
      res.status(404).json({ error: "Image not found" });
      return;
    }

    const filePath = path.resolve(resolveStoredImagePath(user.image));
    res.setHeader("Content-Type", contentTypeForStorageKey(user.image));
    res.setHeader("Cache-Control", "private, no-cache");
    res.sendFile(filePath, (err) => {
      if (err && !res.headersSent) {
        res.status(404).json({ error: "Image not found" });
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load profile image" });
  }
}

export async function deleteProfileImage(
  req: Request,
  res: Response,
): Promise<void> {
  const { sub: userId } = (req as AuthenticatedRequest).sessionUser;

  try {
    const existing = await prisma.user.findUnique({
      where: { id: userId },
      select: profileUserSelect,
    });

    if (!existing) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (existing.image && !existing.image.startsWith("http")) {
      await deleteUserImageFile(existing.image);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { image: null },
      select: profileUserSelect,
    });

    res.json({ user: serializeProfileUser(user) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to remove profile image" });
  }
}
