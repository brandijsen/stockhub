-- Upgrade existing databases that still use the legacy Italian column name.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Article'
      AND column_name = 'sogliaMinima'
  ) THEN
    ALTER TABLE "Article" RENAME COLUMN "sogliaMinima" TO "minThreshold";
  END IF;
END $$;
