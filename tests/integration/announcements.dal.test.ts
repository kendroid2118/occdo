import { Role } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { createAnnouncement, listPublishedAnnouncements } from "@/lib/dal/announcements";
import { prisma } from "@/lib/dal/prisma";
import { createAnnouncementSchema } from "@/lib/validation/announcements";

const prefix = "occdo-040";
const actorEmail = `${prefix}-actor@example.invalid`;

describe("announcement DAL", () => {
  let actorId = "";

  beforeAll(async () => {
    await prisma.announcement.deleteMany({
      where: { title: { startsWith: `${prefix}-` } },
    });
    await prisma.user.deleteMany({ where: { email: actorEmail } });

    const actor = await prisma.user.create({
      data: {
        email: actorEmail,
        name: "OCCDO-040 Actor",
        role: Role.ADMIN,
        isActive: true,
        passwordHash: "placeholder-hash-not-a-password",
      },
      select: { id: true },
    });
    actorId = actor.id;
  });

  afterAll(async () => {
    await prisma.announcement.deleteMany({
      where: { title: { startsWith: `${prefix}-` } },
    });
    await prisma.auditLog.deleteMany({ where: { actorId } });
    await prisma.user.deleteMany({ where: { email: actorEmail } });
    await prisma.$disconnect();
  });

  it("creates an announcement and lists only published active unexpired rows", async () => {
    const asOf = new Date("2026-09-23T01:00:00.000Z");

    const published = await createAnnouncement({
      actorId,
      input: createAnnouncementSchema.parse({
        title: `${prefix}-live`,
        body: "Visible on the dashboard.",
        publishedAt: "2026-09-23T08:00",
        expiresAt: "2026-09-24T17:00",
        isActive: true,
      }),
    });
    expect(published.publishedAt.toISOString()).toBe("2026-09-23T00:00:00.000Z");

    await createAnnouncement({
      actorId,
      input: createAnnouncementSchema.parse({
        title: `${prefix}-inactive`,
        body: "Hidden",
        publishedAt: "2026-09-22T08:00",
        isActive: false,
      }),
    });
    await createAnnouncement({
      actorId,
      input: createAnnouncementSchema.parse({
        title: `${prefix}-future`,
        body: "Not yet",
        publishedAt: "2026-09-23T10:00",
        isActive: true,
      }),
    });
    await createAnnouncement({
      actorId,
      input: createAnnouncementSchema.parse({
        title: `${prefix}-expired`,
        body: "Too late",
        publishedAt: "2026-09-22T08:00",
        expiresAt: "2026-09-23T08:00",
        isActive: true,
      }),
    });
    await createAnnouncement({
      actorId,
      input: createAnnouncementSchema.parse({
        title: `${prefix}-older`,
        body: "Older published",
        publishedAt: "2026-09-22T08:00",
        isActive: true,
      }),
    });

    const listed = await listPublishedAnnouncements({ asOf, take: 10 });
    const titles = listed
      .filter((row) => row.title.startsWith(`${prefix}-`))
      .map((row) => row.title);

    expect(titles).toEqual([`${prefix}-live`, `${prefix}-older`]);
    expect(titles).not.toContain(`${prefix}-inactive`);
    expect(titles).not.toContain(`${prefix}-future`);
    expect(titles).not.toContain(`${prefix}-expired`);

    const limited = await listPublishedAnnouncements({ asOf, take: 1 });
    expect(limited).toHaveLength(1);

    const audit = await prisma.auditLog.findFirst({
      where: { entityId: published.id, action: "ANNOUNCEMENT_CREATE" },
      select: { entityType: true, metadata: true },
    });
    expect(audit?.entityType).toBe("Announcement");
    expect(JSON.stringify(audit?.metadata)).not.toContain("passwordHash");
  });
});
