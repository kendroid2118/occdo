import "server-only";

import { writeAuditLog } from "@/lib/dal/audit";
import { prisma } from "@/lib/dal/prisma";

export const CDA_PORTAL_CONFIG_KEY = "cdaPortalUrl";

export type SystemConfigRecord = {
  key: string;
  value: string;
  updatedAt: Date;
};

function configSnapshot(row: SystemConfigRecord) {
  return { key: row.key, value: row.value };
}

export async function getSystemConfigValue(key: string): Promise<string | null> {
  if (key !== CDA_PORTAL_CONFIG_KEY) {
    return null;
  }
  const row = await prisma.systemConfig.findUnique({
    where: { key },
    select: { value: true },
  });
  const value = row?.value.trim() ?? "";
  return value ? value : null;
}

export async function upsertCdaPortalUrl(options: {
  actorId: string;
  value: string;
}): Promise<SystemConfigRecord | null> {
  const value = options.value.trim();

  return prisma.$transaction(async (tx) => {
    const existing = await tx.systemConfig.findUnique({
      where: { key: CDA_PORTAL_CONFIG_KEY },
      select: { key: true, value: true, updatedAt: true },
    });

    if (!value) {
      if (existing) {
        await tx.systemConfig.delete({ where: { key: CDA_PORTAL_CONFIG_KEY } });
        await writeAuditLog(
          {
            actorId: options.actorId,
            action: "SYSTEM_CONFIG_UPDATE",
            entityType: "SystemConfig",
            entityId: CDA_PORTAL_CONFIG_KEY,
            source: "WEB",
            metadata: { before: configSnapshot(existing), after: { key: CDA_PORTAL_CONFIG_KEY, value: "" } },
          },
          tx,
        );
      }
      return null;
    }

    const saved = await tx.systemConfig.upsert({
      where: { key: CDA_PORTAL_CONFIG_KEY },
      create: {
        key: CDA_PORTAL_CONFIG_KEY,
        value,
        updatedById: options.actorId,
      },
      update: {
        value,
        updatedById: options.actorId,
      },
      select: { key: true, value: true, updatedAt: true },
    });

    await writeAuditLog(
      {
        actorId: options.actorId,
        action: "SYSTEM_CONFIG_UPDATE",
        entityType: "SystemConfig",
        entityId: CDA_PORTAL_CONFIG_KEY,
        source: "WEB",
        metadata: {
          before: existing ? configSnapshot(existing) : null,
          after: configSnapshot(saved),
        },
      },
      tx,
    );

    return saved;
  });
}
