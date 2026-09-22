-- CreateTable
CREATE TABLE "AccreditationCaseType" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccreditationCaseType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccreditationCaseStatus" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccreditationCaseStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccreditationCase" (
    "id" TEXT NOT NULL,
    "cooperativeId" TEXT NOT NULL,
    "typeId" TEXT NOT NULL,
    "statusId" TEXT NOT NULL,
    "filedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" TIMESTAMP(3),
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT NOT NULL,

    CONSTRAINT "AccreditationCase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccreditationCaseType_code_key" ON "AccreditationCaseType"("code");

-- CreateIndex
CREATE INDEX "AccreditationCaseType_isActive_sortOrder_idx" ON "AccreditationCaseType"("isActive", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "AccreditationCaseStatus_code_key" ON "AccreditationCaseStatus"("code");

-- CreateIndex
CREATE INDEX "AccreditationCaseStatus_isActive_sortOrder_idx" ON "AccreditationCaseStatus"("isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "AccreditationCase_cooperativeId_idx" ON "AccreditationCase"("cooperativeId");

-- CreateIndex
CREATE INDEX "AccreditationCase_typeId_idx" ON "AccreditationCase"("typeId");

-- CreateIndex
CREATE INDEX "AccreditationCase_statusId_idx" ON "AccreditationCase"("statusId");

-- AddForeignKey
ALTER TABLE "AccreditationCase" ADD CONSTRAINT "AccreditationCase_cooperativeId_fkey" FOREIGN KEY ("cooperativeId") REFERENCES "Cooperative"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccreditationCase" ADD CONSTRAINT "AccreditationCase_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "AccreditationCaseType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccreditationCase" ADD CONSTRAINT "AccreditationCase_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "AccreditationCaseStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccreditationCase" ADD CONSTRAINT "AccreditationCase_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccreditationCase" ADD CONSTRAINT "AccreditationCase_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
