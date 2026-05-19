-- User rows exist only after email verification (no unverified users).
DELETE FROM "User" WHERE "emailVerified" IS NULL;

ALTER TABLE "User" ALTER COLUMN "emailVerified" SET NOT NULL;

-- Legacy Auth.js-style tokens (pre PendingRegistration-only signup).
DROP TABLE IF EXISTS "VerificationToken";
