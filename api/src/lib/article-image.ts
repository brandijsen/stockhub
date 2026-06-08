import fs from "node:fs/promises";
import path from "node:path";

export const UPLOAD_ROOT = path.join(__dirname, "..", "..", "uploads");
export const ARTICLE_IMAGES_DIR = path.join(UPLOAD_ROOT, "articles");

export const ARTICLE_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const ARTICLE_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export function extensionForMime(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    default:
      throw new Error(`Unsupported image type: ${mime}`);
  }
}

export function articleImagePublicPath(articleId: string): string {
  return `/api/articles/${articleId}/image`;
}

export function resolveStoredImagePath(storageKey: string): string {
  const normalized = path.normalize(storageKey).replace(/^(\.\.(\/|\\|$))+/, "");
  const full = path.join(UPLOAD_ROOT, normalized);
  if (!full.startsWith(UPLOAD_ROOT)) {
    throw new Error("Invalid image path");
  }
  return full;
}

export async function deleteArticleImageFile(
  storageKey: string | null | undefined,
): Promise<void> {
  if (!storageKey) {
    return;
  }
  try {
    await fs.unlink(resolveStoredImagePath(storageKey));
  } catch {
    // missing file is fine
  }
}

export async function removeArticleImageVariants(articleId: string): Promise<void> {
  await fs.mkdir(ARTICLE_IMAGES_DIR, { recursive: true });
  for (const ext of [".jpg", ".jpeg", ".png", ".webp"]) {
    try {
      await fs.unlink(path.join(ARTICLE_IMAGES_DIR, `${articleId}${ext}`));
    } catch {
      // ignore
    }
  }
}

export async function saveArticleImageFile(
  articleId: string,
  buffer: Buffer,
  mime: string,
): Promise<string> {
  await removeArticleImageVariants(articleId);
  const ext = extensionForMime(mime);
  const storageKey = path.posix.join("articles", `${articleId}${ext}`);
  const fullPath = resolveStoredImagePath(storageKey);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, buffer);
  return storageKey;
}

export function contentTypeForStorageKey(storageKey: string): string {
  if (storageKey.endsWith(".png")) {
    return "image/png";
  }
  if (storageKey.endsWith(".webp")) {
    return "image/webp";
  }
  return "image/jpeg";
}
