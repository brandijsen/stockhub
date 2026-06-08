import multer from "multer";

import {
  ARTICLE_IMAGE_MAX_BYTES,
  ARTICLE_IMAGE_MIME_TYPES,
} from "../lib/article-image";

export const articleImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: ARTICLE_IMAGE_MAX_BYTES, files: 1 },
  fileFilter(_req, file, cb) {
    if (!ARTICLE_IMAGE_MIME_TYPES.has(file.mimetype)) {
      cb(new Error("Only JPEG, PNG, and WebP images are allowed"));
      return;
    }
    cb(null, true);
  },
});
