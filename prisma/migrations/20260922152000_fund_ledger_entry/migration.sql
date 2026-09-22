-- CreateEnum
CREATE TYPE "FundLedgerEntryKind" AS ENUM ('DISBURSEMENT', 'ADJUSTMENT', 'RECOVERY');

-- CreateTable
CREATE TABLE "FundLedgerEntry" (
    "id" TEXT NOT NULL,
    "assistanceRecordId" TEXT NOT NULL,
    "entryDate" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "entryKind" "FundLedgerEntryKind" NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordedById" TEXT NOT NULL,

    CONSTRAINT "FundLedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FundLedgerEntry_assistanceRecordId_entryDate_idx" ON "FundLedgerEntry"("assistanceRecordId", "entryDate");

-- CreateIndex
CREATE INDEX "FundLedgerEntry_entryKind_idx" ON "FundLedgerEntry"("entryKind");

-- CreateIndex
CREATE UNIQUE INDEX "FundLedgerEntry_assistanceRecordId_disbursement_key" ON "FundLedgerEntry"("assistanceRecordId") WHERE "entryKind" = 'DISBURSEMENT';

-- AddForeignKey
ALTER TABLE "FundLedgerEntry" ADD CONSTRAINT "FundLedgerEntry_assistanceRecordId_fkey" FOREIGN KEY ("assistanceRecordId") REFERENCES "AssistanceRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundLedgerEntry" ADD CONSTRAINT "FundLedgerEntry_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
