import { PrismaClient, Role } from "@prisma/client";

import { hashPassword } from "../lib/auth/password";
import { seedCooperativeReferenceData } from "./seed-reference";

/**
 * Seed policy:
 * - Development may insert labeled demo/reference fixtures.
 * - Never seed real production credentials or unlabeled fake cooperatives.
 * - Production must not insert the demo user.
 *
 * M0 upserts AppMeta. M1 may upsert a labeled demo staff user when
 * SEED_DEMO_PASSWORD is set and NODE_ENV is not production.
 * M2 upserts maintainable cooperative reference catalogs (not credentials).
 */
async function seed(): Promise<void> {
  const prisma = new PrismaClient();

  try {
    await prisma.appMeta.upsert({
      where: { id: "occdo" },
      create: { id: "occdo", name: "OCCDO" },
      update: { name: "OCCDO" },
    });

    await seedCooperativeReferenceData(prisma);

    const nodeEnv = process.env.NODE_ENV;
    const demoPassword = process.env.SEED_DEMO_PASSWORD;
    const demoEmail = (process.env.SEED_DEMO_EMAIL ?? "demo.user@occdo.local").toLowerCase();

    if (nodeEnv !== "production" && demoPassword) {
      const passwordHash = await hashPassword(demoPassword);
      const demoAdminEmail = (
        process.env.SEED_DEMO_ADMIN_EMAIL ?? "demo.admin@occdo.local"
      ).toLowerCase();

      await prisma.user.upsert({
        where: { email: demoEmail },
        create: {
          email: demoEmail,
          name: "OCCDO Demo User (seed)",
          role: Role.USER,
          isActive: true,
          passwordHash,
        },
        update: {
          name: "OCCDO Demo User (seed)",
          isActive: true,
          passwordHash,
        },
      });

      await prisma.user.upsert({
        where: { email: demoAdminEmail },
        create: {
          email: demoAdminEmail,
          name: "OCCDO Demo Admin (seed)",
          role: Role.ADMIN,
          isActive: true,
          passwordHash,
        },
        update: {
          name: "OCCDO Demo Admin (seed)",
          isActive: true,
          passwordHash,
        },
      });
    }
  } finally {
    await prisma.$disconnect();
  }
}

seed().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown seed error";
  console.error(message);
  process.exitCode = 1;
});
