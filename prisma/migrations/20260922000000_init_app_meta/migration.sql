-- CreateTable
CREATE TABLE "AppMeta" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'OCCDO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppMeta_pkey" PRIMARY KEY ("id")
);
