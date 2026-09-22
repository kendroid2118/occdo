-- CreateTable
CREATE TABLE "AssistanceType" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssistanceType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssistanceStatus" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssistanceStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssistanceRecord" (
    "id" TEXT NOT NULL,
    "cooperativeId" TEXT NOT NULL,
    "assistanceTypeId" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL,
    "approvedAt" TIMESTAMP(3),
    "releasedAt" TIMESTAMP(3),
    "statusId" TEXT NOT NULL,
    "fundSource" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT NOT NULL,

    CONSTRAINT "AssistanceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AssistanceType_code_key" ON "AssistanceType"("code");

-- CreateIndex
CREATE INDEX "AssistanceType_isActive_sortOrder_idx" ON "AssistanceType"("isActive", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "AssistanceStatus_code_key" ON "AssistanceStatus"("code");

-- CreateIndex
CREATE INDEX "AssistanceStatus_isActive_sortOrder_idx" ON "AssistanceStatus"("isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "AssistanceRecord_cooperativeId_idx" ON "AssistanceRecord"("cooperativeId");

-- CreateIndex
CREATE INDEX "AssistanceRecord_assistanceTypeId_idx" ON "AssistanceRecord"("assistanceTypeId");

-- CreateIndex
CREATE INDEX "AssistanceRecord_statusId_idx" ON "AssistanceRecord"("statusId");

-- CreateIndex
CREATE INDEX "AssistanceRecord_requestedAt_idx" ON "AssistanceRecord"("requestedAt");

-- AddForeignKey
ALTER TABLE "AssistanceRecord" ADD CONSTRAINT "AssistanceRecord_cooperativeId_fkey" FOREIGN KEY ("cooperativeId") REFERENCES "Cooperative"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssistanceRecord" ADD CONSTRAINT "AssistanceRecord_assistanceTypeId_fkey" FOREIGN KEY ("assistanceTypeId") REFERENCES "AssistanceType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssistanceRecord" ADD CONSTRAINT "AssistanceRecord_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "AssistanceStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssistanceRecord" ADD CONSTRAINT "AssistanceRecord_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssistanceRecord" ADD CONSTRAINT "AssistanceRecord_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
