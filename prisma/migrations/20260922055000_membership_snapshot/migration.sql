-- CreateTable
CREATE TABLE "MembershipSnapshot" (
    "id" TEXT NOT NULL,
    "cooperativeId" TEXT NOT NULL,
    "asOfDate" DATE NOT NULL,
    "totalMembers" INTEGER NOT NULL DEFAULT 0,
    "maleMembers" INTEGER NOT NULL DEFAULT 0,
    "femaleMembers" INTEGER NOT NULL DEFAULT 0,
    "source" TEXT NOT NULL,
    "recordedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MembershipSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MembershipSnapshot_cooperativeId_idx" ON "MembershipSnapshot"("cooperativeId");

-- CreateIndex
CREATE UNIQUE INDEX "MembershipSnapshot_cooperativeId_asOfDate_key" ON "MembershipSnapshot"("cooperativeId", "asOfDate");

-- AddForeignKey
ALTER TABLE "MembershipSnapshot" ADD CONSTRAINT "MembershipSnapshot_cooperativeId_fkey" FOREIGN KEY ("cooperativeId") REFERENCES "Cooperative"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembershipSnapshot" ADD CONSTRAINT "MembershipSnapshot_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
