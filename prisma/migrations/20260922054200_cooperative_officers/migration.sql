-- CreateTable
CREATE TABLE "OfficerPosition" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OfficerPosition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CooperativeOfficer" (
    "id" TEXT NOT NULL,
    "cooperativeId" TEXT NOT NULL,
    "positionId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "contactNumber" TEXT,
    "email" TEXT,
    "isPrimaryContact" BOOLEAN NOT NULL DEFAULT false,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CooperativeOfficer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OfficerPosition_code_key" ON "OfficerPosition"("code");

-- CreateIndex
CREATE INDEX "OfficerPosition_isActive_sortOrder_idx" ON "OfficerPosition"("isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "CooperativeOfficer_cooperativeId_idx" ON "CooperativeOfficer"("cooperativeId");

-- CreateIndex
CREATE INDEX "CooperativeOfficer_positionId_idx" ON "CooperativeOfficer"("positionId");

-- CreateIndex
CREATE INDEX "CooperativeOfficer_cooperativeId_isPrimaryContact_idx" ON "CooperativeOfficer"("cooperativeId", "isPrimaryContact");

-- AddForeignKey
ALTER TABLE "CooperativeOfficer" ADD CONSTRAINT "CooperativeOfficer_cooperativeId_fkey" FOREIGN KEY ("cooperativeId") REFERENCES "Cooperative"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CooperativeOfficer" ADD CONSTRAINT "CooperativeOfficer_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "OfficerPosition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
