-- CreateTable
CREATE TABLE "DocumentType" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CooperativeDocument" (
    "id" TEXT NOT NULL,
    "cooperativeId" TEXT NOT NULL,
    "documentTypeId" TEXT NOT NULL,
    "reportingPeriod" TEXT,
    "originalFilename" TEXT NOT NULL,
    "storedFilename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedById" TEXT NOT NULL,

    CONSTRAINT "CooperativeDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DocumentType_code_key" ON "DocumentType"("code");

-- CreateIndex
CREATE INDEX "DocumentType_isActive_sortOrder_idx" ON "DocumentType"("isActive", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "CooperativeDocument_storedFilename_key" ON "CooperativeDocument"("storedFilename");

-- CreateIndex
CREATE INDEX "CooperativeDocument_cooperativeId_idx" ON "CooperativeDocument"("cooperativeId");

-- CreateIndex
CREATE INDEX "CooperativeDocument_documentTypeId_idx" ON "CooperativeDocument"("documentTypeId");

-- CreateIndex
CREATE INDEX "CooperativeDocument_uploadedAt_idx" ON "CooperativeDocument"("uploadedAt");

-- AddForeignKey
ALTER TABLE "CooperativeDocument" ADD CONSTRAINT "CooperativeDocument_cooperativeId_fkey" FOREIGN KEY ("cooperativeId") REFERENCES "Cooperative"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CooperativeDocument" ADD CONSTRAINT "CooperativeDocument_documentTypeId_fkey" FOREIGN KEY ("documentTypeId") REFERENCES "DocumentType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CooperativeDocument" ADD CONSTRAINT "CooperativeDocument_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
