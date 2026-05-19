import type { Request, RequestHandler } from "express";
import rateLimit, { type Options } from "express-rate-limit";

const skipRateLimit = (): boolean =>
  process.env.RATE_LIMIT_DISABLED === "1" ||
  process.env.NODE_ENV === "test";

function clientKey(req: Request): string {
  return req.ip ?? req.socket.remoteAddress ?? "unknown";
}

function loginRegisterKey(req: Request): string {
  const email =
    typeof req.body?.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";
  return `${clientKey(req)}:${email || "_"}`;
}

function resendKey(req: Request): string {
  const token =
    typeof req.body?.token === "string" ? req.body.token.trim() : "";
  return `${clientKey(req)}:${token.slice(0, 24) || "_"}`;
}

function verifyEmailKey(req: Request): string {
  const token =
    typeof req.query.token === "string" ? req.query.token.trim() : "";
  return `${clientKey(req)}:${token.slice(0, 24) || "_"}`;
}

function rateLimitHandler(message: string): NonNullable<Options["handler"]> {
  return (_req, res, _next, options) => {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil(options.windowMs / 1000),
    );
    res.setHeader("Retry-After", String(retryAfterSeconds));
    res.status(429).json({
      error: message,
      retryAfterSeconds,
    });
  };
}

const baseOptions: Partial<Options> = {
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skip: skipRateLimit,
};

/** Sign-in attempts (per IP + email). */
export const loginRateLimit: RequestHandler = rateLimit({
  ...baseOptions,
  windowMs: 15 * 60 * 1000,
  limit: 20,
  keyGenerator: loginRegisterKey,
  handler: rateLimitHandler(
    "Too many sign-in attempts. Please wait a few minutes before trying again.",
  ),
});

/** New registrations (per IP + email). */
export const registerRateLimit: RequestHandler = rateLimit({
  ...baseOptions,
  windowMs: 60 * 60 * 1000,
  limit: 8,
  keyGenerator: loginRegisterKey,
  handler: rateLimitHandler(
    "Too many registration attempts from this device. Please try again later.",
  ),
});

/** Resend verification (per IP + token prefix). */
export const resendVerificationRateLimit: RequestHandler = rateLimit({
  ...baseOptions,
  windowMs: 15 * 60 * 1000,
  limit: 12,
  keyGenerator: resendKey,
  handler: rateLimitHandler(
    "Too many resend requests. Please wait before requesting another email.",
  ),
});

/** Opening verification links (per IP + token prefix). */
export const verifyEmailRateLimit: RequestHandler = rateLimit({
  ...baseOptions,
  windowMs: 15 * 60 * 1000,
  limit: 40,
  keyGenerator: verifyEmailKey,
  handler: rateLimitHandler(
    "Too many verification attempts. Please wait a few minutes and try the link again.",
  ),
});
