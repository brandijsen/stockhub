-- Make supplier and customer email optional (contact field only; no outbound mail).

ALTER TABLE "Supplier" ALTER COLUMN "email" DROP NOT NULL;
ALTER TABLE "Customer" ALTER COLUMN "email" DROP NOT NULL;
