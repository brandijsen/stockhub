import type { NextFunction, Request, Response } from "express";

/** Last-resort handler for `/api/*` with no matching route. */
export function apiNotFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: "Not found",
    path: req.originalUrl ?? req.url,
  });
}

/** Express global error handler (4-arg). */
export function apiErrorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (res.headersSent) {
    return;
  }
  console.error("[api]", err);
  const message =
    process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err instanceof Error
        ? err.message
        : "Internal server error";
  res.status(500).json({ error: message });
}
