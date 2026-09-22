import { PrismaClient } from "@prisma/client";

/**
 * Seed policy:
 * - Development may insert labeled demo/reference fixtures in later milestones.
 * - Never seed real production credentials, password hashes from live systems, or unlabeled fake cooperatives.
 * - Production seed must not include demo cooperatives unless OCCDO explicitly asks.
 *
 * M0 only upserts AppMeta so this runner is executable without domain data.
 */
async function seed(): Promise<void> {
  const prisma = new PrismaClient();

  try {
    await prisma.appMeta.upsert({
      where: { id: "occdo" },
      create: { id: "occdo", name: "OCCDO" },
      update: { name: "OCCDO" },
    });
  } finally {
    await prisma.$disconnect();
  }
}

seed().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown seed error";
  console.error(message);
  process.exitCode = 1;
});
