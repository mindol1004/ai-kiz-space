-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'LOW_STOCK';

-- AlterEnum
ALTER TYPE "StockChangeType" ADD VALUE 'CANCEL';

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "lowStockThreshold" INTEGER NOT NULL DEFAULT 10;

-- CreateIndex
CREATE INDEX "stock_histories_createdBy_idx" ON "stock_histories"("createdBy");

-- AddForeignKey
ALTER TABLE "stock_histories" ADD CONSTRAINT "stock_histories_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
