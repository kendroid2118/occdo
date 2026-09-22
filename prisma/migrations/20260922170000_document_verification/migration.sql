-- AlterTable
ALTER TABLE "CooperativeDocument" ADD COLUMN "verificationStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED';
ALTER TABLE "CooperativeDocument" ADD COLUMN "verifiedAt" TIMESTAMP(3);
ALTER TABLE "CooperativeDocument" ADD COLUMN "verifiedById" TEXT;

-- CreateIndex
CREATE INDEX "CooperativeDocument_verificationStatus_idx" ON "CooperativeDocument"("verificationStatus");

-- AddForeignKey
ALTER TABLE "CooperativeDocument" ADD CONSTRAINT "CooperativeDocument_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "DocumentTemplate" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DocumentTemplate_code_key" ON "DocumentTemplate"("code");

-- CreateIndex
CREATE INDEX "DocumentTemplate_isActive_sortOrder_idx" ON "DocumentTemplate"("isActive", "sortOrder");
