-- Split User.name into firstName + lastName (required)
ALTER TABLE "User" ADD COLUMN "firstName" TEXT;
ALTER TABLE "User" ADD COLUMN "lastName" TEXT;

UPDATE "User" SET
  "firstName" = CASE
    WHEN "name" IS NOT NULL AND TRIM("name") <> '' AND position(' ' IN TRIM("name")) > 0
      THEN TRIM(SPLIT_PART(TRIM("name"), ' ', 1))
    WHEN "name" IS NOT NULL AND TRIM("name") <> ''
      THEN TRIM("name")
    ELSE 'User'
  END,
  "lastName" = CASE
    WHEN "name" IS NOT NULL AND TRIM("name") <> '' AND position(' ' IN TRIM("name")) > 0
      THEN TRIM(SUBSTRING(TRIM("name") FROM position(' ' IN TRIM("name")) + 1))
    WHEN "name" IS NOT NULL AND TRIM("name") <> ''
      THEN TRIM("name")
    ELSE 'User'
  END;

ALTER TABLE "User" DROP COLUMN "name";
ALTER TABLE "User" ALTER COLUMN "firstName" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "lastName" SET NOT NULL;

-- PendingRegistration: same
ALTER TABLE "PendingRegistration" ADD COLUMN "firstName" TEXT;
ALTER TABLE "PendingRegistration" ADD COLUMN "lastName" TEXT;

UPDATE "PendingRegistration" SET
  "firstName" = CASE
    WHEN "name" IS NOT NULL AND TRIM("name") <> '' AND position(' ' IN TRIM("name")) > 0
      THEN TRIM(SPLIT_PART(TRIM("name"), ' ', 1))
    WHEN "name" IS NOT NULL AND TRIM("name") <> ''
      THEN TRIM("name")
    ELSE 'Pending'
  END,
  "lastName" = CASE
    WHEN "name" IS NOT NULL AND TRIM("name") <> '' AND position(' ' IN TRIM("name")) > 0
      THEN TRIM(SUBSTRING(TRIM("name") FROM position(' ' IN TRIM("name")) + 1))
    WHEN "name" IS NOT NULL AND TRIM("name") <> ''
      THEN TRIM("name")
    ELSE 'Pending'
  END;

ALTER TABLE "PendingRegistration" DROP COLUMN "name";
ALTER TABLE "PendingRegistration" ALTER COLUMN "firstName" SET NOT NULL;
ALTER TABLE "PendingRegistration" ALTER COLUMN "lastName" SET NOT NULL;
