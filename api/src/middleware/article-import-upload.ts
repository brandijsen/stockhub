import multer from "multer";

const EXCEL_MIME_TYPES = new Set([
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "application/octet-stream",
]);

export const ARTICLE_IMPORT_MAX_BYTES = 5 * 1024 * 1024;

export const articleImportUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: ARTICLE_IMPORT_MAX_BYTES, files: 1 },
  fileFilter(_req, file, cb) {
    const name = file.originalname.toLowerCase();
    const mimeOk = EXCEL_MIME_TYPES.has(file.mimetype);
    const extOk = name.endsWith(".xlsx") || name.endsWith(".xls");
    if (!mimeOk && !extOk) {
      cb(new Error("Only .xlsx or .xls files are allowed"));
      return;
    }
    cb(null, true);
  },
});
