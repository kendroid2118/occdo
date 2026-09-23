-- CreateEnum
CREATE TYPE "CalendarActivityKind" AS ENUM ('ACTIVITY', 'TRAINING', 'DEADLINE');

-- CreateTable
CREATE TABLE "CalendarActivity" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "kind" "CalendarActivityKind" NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3),
    "location" TEXT,
    "remarks" TEXT,
    "cooperativeId" TEXT,
    "trainingEventId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT NOT NULL,

    CONSTRAINT "CalendarActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CalendarActivity_startAt_idx" ON "CalendarActivity"("startAt");

-- CreateIndex
CREATE INDEX "CalendarActivity_kind_idx" ON "CalendarActivity"("kind");

-- CreateIndex
CREATE INDEX "CalendarActivity_cooperativeId_idx" ON "CalendarActivity"("cooperativeId");

-- CreateIndex
CREATE INDEX "CalendarActivity_trainingEventId_idx" ON "CalendarActivity"("trainingEventId");

-- AddForeignKey
ALTER TABLE "CalendarActivity" ADD CONSTRAINT "CalendarActivity_cooperativeId_fkey" FOREIGN KEY ("cooperativeId") REFERENCES "Cooperative"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarActivity" ADD CONSTRAINT "CalendarActivity_trainingEventId_fkey" FOREIGN KEY ("trainingEventId") REFERENCES "TrainingEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarActivity" ADD CONSTRAINT "CalendarActivity_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarActivity" ADD CONSTRAINT "CalendarActivity_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
