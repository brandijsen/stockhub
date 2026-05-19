/** Builds user-visible text from API `429` JSON (`error` + optional `retryAfterSeconds`). */
export function rateLimitErrorMessage(data: unknown): string {
  const d = data as { error?: string; retryAfterSeconds?: number } | null;
  let msg =
    (typeof d?.error === "string" && d.error.trim()) ||
    "Too many requests from this device. Please try again later.";
  const s = d?.retryAfterSeconds;
  if (typeof s === "number" && s > 0) {
    if (s >= 60) {
      const m = Math.ceil(s / 60);
      msg += ` Retry in about ${m} minute${m === 1 ? "" : "s"}.`;
    } else {
      msg += ` Retry in about ${s} seconds.`;
    }
  }
  return msg;
}
