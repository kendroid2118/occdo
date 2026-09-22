import "server-only";

import type { Prisma } from "@prisma/client";
import { z } from "zod";

import { redactAuditMetadata } from "@/lib/dal/audit-redact";
import { prisma } from "@/lib/dal/prisma";

const writeAuditLogSchema = z.object({
  actorId: z.string().min(1).optional(),
  action: z.string().trim().min(1).max(128),
  entityType: z.string().trim().min(1).max(64),
  entityId: z.string().trim().min(1).max(128),
  source: z.string().trim().min(1).max(32).default("WEB"),
  metadata: z.unknown().optional(),
});

export type WriteAuditLogInput = z.input<typeof writeAuditLogSchema>;

const auditLogSelect = {
  id: true,
  actorId: true,
  action: true,
  entityType: true,
  entityId: true,
  occurredAt: true,
  source: true,
  metadata: true,
} as const;

export async function writeAuditLog(
  input: WriteAuditLogInput,
  db: Prisma.TransactionClient | typeof prisma = prisma,
) {
  const parsed = writeAuditLogSchema.parse(input);
  const metadata =
    parsed.metadata === undefined ? undefined : redactAuditMetadata(parsed.metadata);

  return db.auditLog.create({
    data: {
      actorId: parsed.actorId,
      action: parsed.action,
      entityType: parsed.entityType,
      entityId: parsed.entityId,
      source: parsed.source,
      metadata:
        metadata === undefined ? undefined : (metadata as Prisma.InputJsonValue),
    },
    select: auditLogSelect,
  });
}
