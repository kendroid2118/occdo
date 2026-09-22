-- CreateTable
CREATE TABLE "CooperativeType" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CooperativeType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CooperativeSector" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CooperativeSector_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CooperativeStatus" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CooperativeStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccreditationStatus" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccreditationStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Barangay" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Barangay_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CooperativeType_code_key" ON "CooperativeType"("code");

-- CreateIndex
CREATE INDEX "CooperativeType_isActive_sortOrder_idx" ON "CooperativeType"("isActive", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "CooperativeSector_code_key" ON "CooperativeSector"("code");

-- CreateIndex
CREATE INDEX "CooperativeSector_isActive_sortOrder_idx" ON "CooperativeSector"("isActive", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "CooperativeStatus_code_key" ON "CooperativeStatus"("code");

-- CreateIndex
CREATE INDEX "CooperativeStatus_isActive_sortOrder_idx" ON "CooperativeStatus"("isActive", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "AccreditationStatus_code_key" ON "AccreditationStatus"("code");

-- CreateIndex
CREATE INDEX "AccreditationStatus_isActive_sortOrder_idx" ON "AccreditationStatus"("isActive", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Barangay_code_key" ON "Barangay"("code");

-- CreateIndex
CREATE INDEX "Barangay_isActive_sortOrder_idx" ON "Barangay"("isActive", "sortOrder");
