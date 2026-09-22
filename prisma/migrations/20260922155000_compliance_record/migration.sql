-- CreateTable
CREATE TABLE "ComplianceStatus" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComplianceStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceRecord" (
    "id" TEXT NOT NULL,
    "cooperativeId" TEXT NOT NULL,
    "requirementId" TEXT NOT NULL,
    "reportingPeriod" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "submittedDate" TIMESTAMP(3),
    "statusId" TEXT NOT NULL,
    "remarks" TEXT,
    "verifiedById" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "ComplianceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ComplianceStatus_code_key" ON "ComplianceStatus"("code");

-- CreateIndex
CREATE INDEX "ComplianceStatus_isActive_sortOrder_idx" ON "ComplianceStatus"("isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "ComplianceRecord_cooperativeId_idx" ON "ComplianceRecord"("cooperativeId");

-- CreateIndex
CREATE INDEX "ComplianceRecord_requirementId_idx" ON "ComplianceRecord"("requirementId");

-- CreateIndex
CREATE INDEX "ComplianceRecord_statusId_idx" ON "ComplianceRecord"("statusId");

-- CreateIndex
CREATE INDEX "ComplianceRecord_dueDate_idx" ON "ComplianceRecord"("dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "ComplianceRecord_coop_req_period_key" ON "ComplianceRecord"("cooperativeId", "requirementId", "reportingPeriod");

-- AddForeignKey
ALTER TABLE "ComplianceRecord" ADD CONSTRAINT "ComplianceRecord_cooperativeId_fkey" FOREIGN KEY ("cooperativeId") REFERENCES "Cooperative"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceRecord" ADD CONSTRAINT "ComplianceRecord_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "ComplianceRequirement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceRecord" ADD CONSTRAINT "ComplianceRecord_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "ComplianceStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceRecord" ADD CONSTRAINT "ComplianceRecord_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceRecord" ADD CONSTRAINT "ComplianceRecord_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
