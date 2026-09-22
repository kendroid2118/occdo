import "server-only";

import { writeAuditLog } from "@/lib/dal/audit";
import {
  CooperativeNotFoundError,
  cooperativeSelect,
  type CooperativeRecord,
} from "@/lib/dal/cooperatives";
import { prisma } from "@/lib/dal/prisma";
import type { UpdateMembershipInput } from "@/lib/validation/membership";

export const MEMBERSHIP_SNAPSHOT_SOURCE = "PROFILE_UPDATE" as const;

export function membershipAsOfDate(now = new Date()): Date {
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

export async function updateCooperativeMembership(options: {
  input: UpdateMembershipInput;
  actorId: string;
}): Promise<CooperativeRecord> {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.cooperative.findUnique({
      where: { id: options.input.cooperativeId },
      select: cooperativeSelect,
    });
    if (!existing) {
      throw new CooperativeNotFoundError();
    }

    const counts = {
      totalMembers: options.input.totalMembers,
      maleMembers: options.input.maleMembers,
      femaleMembers: options.input.femaleMembers,
    };

    const updated = await tx.cooperative.update({
      where: { id: existing.id },
      data: {
        ...counts,
        updatedById: options.actorId,
      },
      select: cooperativeSelect,
    });

    await tx.membershipSnapshot.upsert({
      where: {
        cooperativeId_asOfDate: {
          cooperativeId: existing.id,
          asOfDate: membershipAsOfDate(),
        },
      },
      create: {
        cooperativeId: existing.id,
        asOfDate: membershipAsOfDate(),
        source: MEMBERSHIP_SNAPSHOT_SOURCE,
        recordedById: options.actorId,
        ...counts,
      },
      update: {
        ...counts,
        source: MEMBERSHIP_SNAPSHOT_SOURCE,
        recordedById: options.actorId,
      },
    });

    await writeAuditLog(
      {
        actorId: options.actorId,
        action: "MEMBERSHIP_UPDATE",
        entityType: "Cooperative",
        entityId: updated.id,
        source: "WEB",
        metadata: {
          before: {
            totalMembers: existing.totalMembers,
            maleMembers: existing.maleMembers,
            femaleMembers: existing.femaleMembers,
          },
          after: counts,
        },
      },
      tx,
    );

    return updated;
  });
}
