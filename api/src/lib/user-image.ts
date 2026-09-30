import fs from "node:fs/promises";
import path from "node:path";

import {
  ARTICLE_IMAGE_MAX_BYTES,
  ARTICLE_IMAGE_MIME_TYPES,
  contentTypeForStorageKey,
  extensionForMime,
  resolveStoredImagePath,
  UPLOAD_ROOT,
} from "./article-image";
import {
  deleteStoredObject,
  storageConfigured,
  uploadPublicObject,
} from "./object-storage";

export const PROFILE_IMAGE_MAX_BYTES = ARTICLE_IMAGE_MAX_BYTES;
export const PROFILE_IMAGE_MIME_TYPES = ARTICLE_IMAGE_MIME_TYPES;

export const USER_IMAGES_DIR = path.join(UPLOAD_ROOT, "users");

export function profileImagePublicPath(): string {
  return "/api/profile/image";
}

export function resolveProfileImageUrl(
  image: string | null | undefined,
): string | null {
  if (!image) {
    return null;
  }
  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }
  return profileImagePublicPath();
}

export async function deleteUserImageFile(
  storageKey: string | null | undefined,
): Promise<void> {
  if (!storageKey) {
    return;
  }
  if (storageKey.startsWith("http://") || storageKey.startsWith("https://")) {
    await deleteStoredObject(storageKey);
    return;
  }
  try {
    await fs.unlink(resolveStoredImagePath(storageKey));
  } catch {
    // missing file is fine
  }
}

export async function removeUserImageVariants(userId: string): Promise<void> {
  await fs.mkdir(USER_IMAGES_DIR, { recursive: true });
  for (const ext of [".jpg", ".jpeg", ".png", ".webp"]) {
    try {
      await fs.unlink(path.join(USER_IMAGES_DIR, `${userId}${ext}`));
    } catch {
      // ignore
    }
  }
}

export async function saveUserImageFile(
  userId: string,
  buffer: Buffer,
  mime: string,
): Promise<string> {
  const ext = extensionForMime(mime);
  const storageKey = path.posix.join("users", `${userId}${ext}`);
  if (storageConfigured()) {
    for (const variant of [".jpg", ".jpeg", ".png", ".webp"]) {
      await deleteStoredObject(`users/${userId}${variant}`);
    }
    return uploadPublicObject(storageKey, buffer, mime);
  }
  await removeUserImageVariants(userId);
  const fullPath = resolveStoredImagePath(storageKey);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, buffer);
  return storageKey;
}

export { contentTypeForStorageKey, resolveStoredImagePath } from "./article-image";
