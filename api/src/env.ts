import fs from "fs";
import path from "path";

import dotenv from "dotenv";

/**
 * Resolve `.env` in several places so dev works whether you run from `api/`,
 * repo root, or after `tsc` (`__dirname` is `dist/`).
 * First file wins per key (dotenv default: no override).
 */
function envPathsToTry(): string[] {
  const list = [
    path.resolve(__dirname, "..", "..", ".env"),
    path.resolve(__dirname, "..", ".env"),
    path.resolve(process.cwd(), ".env"),
    path.resolve(process.cwd(), "..", ".env"),
  ];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of list) {
    const n = path.normalize(p);
    if (seen.has(n)) continue;
    seen.add(n);
    out.push(n);
  }
  return out;
}

const loadedFrom: string[] = [];
for (const p of envPathsToTry()) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
    loadedFrom.push(p);
  }
}

if (!process.env.DATABASE_URL?.trim()) {
  const tried = envPathsToTry();
  console.error(
    "[stockhub-api] DATABASE_URL is missing.\n" +
      "Add it to the repo root `.env` (next to `web/` and `api/`) or `api/.env`.\n" +
      "Paths checked:\n  " +
      tried.join("\n  ") +
      "\nFiles found and loaded:\n  " +
      (loadedFrom.length ? loadedFrom.join("\n  ") : "(none)"),
  );
}

const VERIFY_TTL_MIN = 1;
/** Upper bound avoids absurd values (14 days). */
const VERIFY_TTL_MAX = 14 * 24 * 60;

/**
 * Lifetime (minutes) of pending-registration verification links.
 * Default **1440** (24h) if unset; use e.g. `2` locally for fast expiry tests.
 */
export function verifyTtlMinutes(): number {
  const raw = process.env.VERIFY_TTL_MINUTES?.trim();
  if (raw === undefined || raw === "") {
    return 1440;
  }
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < VERIFY_TTL_MIN || n > VERIFY_TTL_MAX) {
    console.warn(
      `[stockhub-api] VERIFY_TTL_MINUTES must be between ${VERIFY_TTL_MIN} and ${VERIFY_TTL_MAX}; got "${raw}". Using 1440.`,
    );
    return 1440;
  }
  return n;
}

/**
 * Express `trust proxy` — restores `req.ip` / `X-Forwarded-For` behind reverse proxies
 * (needed for accurate rate limiting). Set `1`, `true`, or hop count (e.g. `2`).
 */
export function trustProxySetting(): number | boolean | undefined {
  const v = process.env.TRUST_PROXY?.trim();
  if (!v || v === "0" || v.toLowerCase() === "false") return undefined;
  if (v === "1" || v.toLowerCase() === "true") return 1;
  const n = Number.parseInt(v, 10);
  if (Number.isFinite(n) && n >= 1) return n;
  console.warn(`[stockhub-api] TRUST_PROXY="${v}" is invalid; ignoring.`);
  return undefined;
}

/** Max JSON body size for `express.json()` (Express accepts values like `256kb`, `1mb`). */
export function apiJsonBodyLimit(): string {
  const raw = process.env.API_JSON_BODY_LIMIT?.trim();
  return raw && raw.length > 0 ? raw : "256kb";
}
