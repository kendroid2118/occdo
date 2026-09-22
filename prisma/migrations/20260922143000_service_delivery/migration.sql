-- CreateTable
CREATE TABLE "ServiceDelivery" (
    "id" TEXT NOT NULL,
    "cooperativeId" TEXT NOT NULL,
    "programId" TEXT,
    "serviceTypeId" TEXT NOT NULL,
    "deliveredAt" TIMESTAMP(3) NOT NULL,
    "remarks" TEXT,
    "recordedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ServiceDelivery_cooperativeId_idx" ON "ServiceDelivery"("cooperativeId");

-- CreateIndex
CREATE INDEX "ServiceDelivery_serviceTypeId_deliveredAt_idx" ON "ServiceDelivery"("serviceTypeId", "deliveredAt");

-- CreateIndex
CREATE INDEX "ServiceDelivery_deliveredAt_idx" ON "ServiceDelivery"("deliveredAt");

-- AddForeignKey
ALTER TABLE "ServiceDelivery" ADD CONSTRAINT "ServiceDelivery_cooperativeId_fkey" FOREIGN KEY ("cooperativeId") REFERENCES "Cooperative"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceDelivery" ADD CONSTRAINT "ServiceDelivery_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceDelivery" ADD CONSTRAINT "ServiceDelivery_serviceTypeId_fkey" FOREIGN KEY ("serviceTypeId") REFERENCES "ServiceType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceDelivery" ADD CONSTRAINT "ServiceDelivery_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
