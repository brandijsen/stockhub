-- AlterTable
ALTER TABLE "Movement" ADD COLUMN "relatedCustomerOrderId" TEXT;

-- AddForeignKey
ALTER TABLE "Movement" ADD CONSTRAINT "Movement_relatedCustomerOrderId_fkey" FOREIGN KEY ("relatedCustomerOrderId") REFERENCES "CustomerOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "CustomerOrder_customerId_createdAt_idx" ON "CustomerOrder"("customerId", "createdAt" DESC);
