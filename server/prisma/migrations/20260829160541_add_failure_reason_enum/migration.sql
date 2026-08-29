/*
  Warnings:

  - The `failureReason` column on the `Transaction` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "FailureReason" AS ENUM ('BANK_TIMEOUT', 'INSUFFICIENT_FUNDS', 'CARD_DECLINED', 'NETWORK_ERROR', 'EXPIRED_CARD', 'INVALID_DETAILS', 'FRAUD_SUSPECTED', 'UNKNOWN');

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "failureReason",
ADD COLUMN     "failureReason" "FailureReason";
