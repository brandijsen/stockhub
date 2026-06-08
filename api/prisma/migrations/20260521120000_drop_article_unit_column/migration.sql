-- Drop legacy unit-of-measure string; stock quantity is exposed as "unit" in the API.
ALTER TABLE "Article" DROP COLUMN "unit";
