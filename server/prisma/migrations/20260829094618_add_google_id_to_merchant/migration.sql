/*
  Warnings:

  - A unique constraint covering the columns `[googleId]` on the table `Merchant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Merchant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Merchant" ADD COLUMN     "authProvider" TEXT NOT NULL DEFAULT 'local',
ADD COLUMN     "googleId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "password" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_googleId_key" ON "Merchant"("googleId");
