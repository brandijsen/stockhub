-- Add human-readable order codes for supplier and customer orders.

ALTER TABLE "SupplierOrder" ADD COLUMN "code" TEXT;

WITH numbered AS (
  SELECT
    id,
    'SO-' || LPAD(ROW_NUMBER() OVER (ORDER BY "createdAt", id)::TEXT, 6, '0') AS next_code
  FROM "SupplierOrder"
)
UPDATE "SupplierOrder" AS so
SET "code" = numbered.next_code
FROM numbered
WHERE so.id = numbered.id;

ALTER TABLE "SupplierOrder" ALTER COLUMN "code" SET NOT NULL;
CREATE UNIQUE INDEX "SupplierOrder_code_key" ON "SupplierOrder"("code");

ALTER TABLE "CustomerOrder" ADD COLUMN "code" TEXT;

WITH numbered AS (
  SELECT
    id,
    'CO-' || LPAD(ROW_NUMBER() OVER (ORDER BY "createdAt", id)::TEXT, 6, '0') AS next_code
  FROM "CustomerOrder"
)
UPDATE "CustomerOrder" AS co
SET "code" = numbered.next_code
FROM numbered
WHERE co.id = numbered.id;

ALTER TABLE "CustomerOrder" ALTER COLUMN "code" SET NOT NULL;
CREATE UNIQUE INDEX "CustomerOrder_code_key" ON "CustomerOrder"("code");
