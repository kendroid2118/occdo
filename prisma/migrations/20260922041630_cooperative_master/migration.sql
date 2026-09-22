-- CreateTable
CREATE TABLE "Cooperative" (
    "id" TEXT NOT NULL,
    "cooperativeCode" TEXT NOT NULL,
    "registrationNumber" TEXT,
    "name" TEXT NOT NULL,
    "acronym" TEXT,
    "typeId" TEXT NOT NULL,
    "sectorId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "barangayId" TEXT NOT NULL,
    "contactPerson" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "email" TEXT,
    "dateRegistered" TIMESTAMP(3),
    "dateAccredited" TIMESTAMP(3),
    "accreditationStatusId" TEXT NOT NULL,
    "statusId" TEXT NOT NULL,
    "totalMembers" INTEGER NOT NULL DEFAULT 0,
    "maleMembers" INTEGER NOT NULL DEFAULT 0,
    "femaleMembers" INTEGER NOT NULL DEFAULT 0,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT NOT NULL,

    CONSTRAINT "Cooperative_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cooperative_cooperativeCode_key" ON "Cooperative"("cooperativeCode");

-- CreateIndex
CREATE UNIQUE INDEX "Cooperative_registrationNumber_key" ON "Cooperative"("registrationNumber");

-- CreateIndex
CREATE INDEX "Cooperative_name_idx" ON "Cooperative"("name");

-- CreateIndex
CREATE INDEX "Cooperative_typeId_idx" ON "Cooperative"("typeId");

-- CreateIndex
CREATE INDEX "Cooperative_sectorId_idx" ON "Cooperative"("sectorId");

-- CreateIndex
CREATE INDEX "Cooperative_barangayId_idx" ON "Cooperative"("barangayId");

-- CreateIndex
CREATE INDEX "Cooperative_statusId_idx" ON "Cooperative"("statusId");

-- CreateIndex
CREATE INDEX "Cooperative_accreditationStatusId_idx" ON "Cooperative"("accreditationStatusId");

-- CreateIndex
CREATE INDEX "Cooperative_dateRegistered_idx" ON "Cooperative"("dateRegistered");

-- CreateIndex
CREATE INDEX "Cooperative_dateAccredited_idx" ON "Cooperative"("dateAccredited");

-- AddForeignKey
ALTER TABLE "Cooperative" ADD CONSTRAINT "Cooperative_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "CooperativeType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cooperative" ADD CONSTRAINT "Cooperative_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "CooperativeSector"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cooperative" ADD CONSTRAINT "Cooperative_barangayId_fkey" FOREIGN KEY ("barangayId") REFERENCES "Barangay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cooperative" ADD CONSTRAINT "Cooperative_accreditationStatusId_fkey" FOREIGN KEY ("accreditationStatusId") REFERENCES "AccreditationStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cooperative" ADD CONSTRAINT "Cooperative_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "CooperativeStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cooperative" ADD CONSTRAINT "Cooperative_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cooperative" ADD CONSTRAINT "Cooperative_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
