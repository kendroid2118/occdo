import "server-only";

import type { Prisma } from "@prisma/client";

import { writeAuditLog } from "@/lib/dal/audit";
import { prisma } from "@/lib/dal/prisma";
import type { CreateAnnouncementInput } from "@/lib/validation/announcements";

export { isPublishedAnnouncement } from "@/lib/announcements/published";

const announcementSelect = {
  id: true,
  title: true,
  body: true,
  publishedAt: true,
  expiresAt: true,
  isActive: true,
  createdAt: true,
} as const;

export type AnnouncementRecord = Prisma.AnnouncementGetPayload<{
  select: typeof announcementSelect;
}>;

function announcementSnapshot(row: AnnouncementRecord) {
  return {
    title: row.title,
    publishedAt: row.publishedAt,
    expiresAt: row.expiresAt,
    isActive: row.isActive,
  };
}

export function publishedAnnouncementWhere(asOf: Date): Prisma.AnnouncementWhereInput {
  return {
    isActive: true,
    publishedAt: { lte: asOf },
    OR: [{ expiresAt: null }, { expiresAt: { gt: asOf } }],
  };
}

export async function listPublishedAnnouncements(options?: {
  asOf?: Date;
  take?: number;
}): Promise<AnnouncementRecord[]> {
  const asOf = options?.asOf ?? new Date();
  const take = options?.take ?? 10;
  return prisma.announcement.findMany({
    where: publishedAnnouncementWhere(asOf),
    select: announcementSelect,
    orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
    take,
  });
}

export async function createAnnouncement(options: {
  input: CreateAnnouncementInput;
  actorId: string;
}): Promise<AnnouncementRecord> {
  return prisma.$transaction(async (tx) => {
    const created = await tx.announcement.create({
      data: {
        title: options.input.title,
        body: options.input.body,
        publishedAt: options.input.publishedAt,
        expiresAt: options.input.expiresAt ?? null,
        isActive: options.input.isActive,
        createdById: options.actorId,
        updatedById: options.actorId,
      },
      select: announcementSelect,
    });

    await writeAuditLog(
      {
        actorId: options.actorId,
        action: "ANNOUNCEMENT_CREATE",
        entityType: "Announcement",
        entityId: created.id,
        source: "WEB",
        metadata: { after: announcementSnapshot(created) },
      },
      tx,
    );

    return created;
  });
}
