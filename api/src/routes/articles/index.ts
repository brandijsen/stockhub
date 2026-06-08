import express from "express";

import { articleImageUpload } from "../../middleware/article-upload";
import { articleImportUpload } from "../../middleware/article-import-upload";
import { requireAdmin } from "../../middleware/require-admin";
import { createArticle } from "./handlers/create";
import { deleteArticle } from "./handlers/delete";
import { exportArticles } from "./handlers/export";
import { getArticle } from "./handlers/get-one";
import {
  deleteArticleImage,
  getArticleImage,
  uploadArticleImage,
} from "./handlers/image";
import { importArticles } from "./handlers/import";
import { listArticles } from "./handlers/list";
import { updateArticle } from "./handlers/update";

const router = express.Router();

function handleImageUpload(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
): void {
  articleImageUpload.single("image")(req, res, (err) => {
    if (err) {
      res.status(400).json({
        error: err instanceof Error ? err.message : "Invalid image upload",
      });
      return;
    }
    next();
  });
}

function handleExcelImport(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
): void {
  articleImportUpload.single("file")(req, res, (err) => {
    if (err) {
      res.status(400).json({
        error: err instanceof Error ? err.message : "Invalid Excel upload",
      });
      return;
    }
    next();
  });
}

router.get("/", listArticles);
router.get("/export", exportArticles);
router.post("/import", requireAdmin, handleExcelImport, importArticles);
router.post("/", requireAdmin, createArticle);
router.get("/:id/image", getArticleImage);
router.post("/:id/image", requireAdmin, handleImageUpload, uploadArticleImage);
router.delete("/:id/image", requireAdmin, deleteArticleImage);
router.get("/:id", getArticle);
router.patch("/:id", requireAdmin, updateArticle);
router.delete("/:id", requireAdmin, deleteArticle);

export default router;
