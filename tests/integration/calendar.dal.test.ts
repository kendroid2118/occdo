import { Role } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { seedCooperativeReferenceData } from "../../db/seed-reference";
import {
  CalendarActivityReferenceError,
  createCalendarActivity,
  listCalendarActivities,
  listUpcomingCalendarActivities,
  updateCalendarActivity,
} from "@/lib/dal/calendar";
import { createCooperative } from "@/lib/dal/cooperatives";
import { prisma } from "@/lib/dal/prisma";
import { createCalendarActivitySchema } from "@/lib/validation/calendar";

const prefix = "occdo-039";
const actorEmail = `${prefix}-actor@example.invalid`;

describe("calendar activity DAL", () => {
  let actorId = "";
  let cooperativeId = "";

  beforeAll(async () => {
    await seedCooperativeReferenceData(prisma);
    await prisma.calendarActivity.deleteMany({
      where: { title: { startsWith: `${prefix}-` } },
    });
    await prisma.cooperative.deleteMany({
      where: { cooperativeCode: { startsWith: `${prefix}-` } },
    });
    await prisma.user.deleteMany({ where: { email: actorEmail } });
    await prisma.cooperativeType.deleteMany({ where: { code: `${prefix}-CT` } });
    await prisma.cooperativeStatus.deleteMany({ where: { code: `${prefix}-CS` } });
    await prisma.accreditationStatus.deleteMany({ where: { code: `${prefix}-ACC` } });

    const [actor, coopType, sector, barangay, coopStatus, accreditation] = await Promise.all([
      prisma.user.create({
        data: {
          email: actorEmail,
          name: "OCCDO-039 Actor",
          role: Role.ADMIN,
          isActive: true,
          passwordHash: "placeholder-hash-not-a-password",
        },
        select: { id: true },
      }),
      prisma.cooperativeType.create({
        data: { code: `${prefix}-CT`, name: "Cal type", sortOrder: 1 },
        select: { id: true },
      }),
      prisma.cooperativeSector.findFirst({ where: { isActive: true }, select: { id: true } }),
      prisma.barangay.findFirst({ where: { isActive: true }, select: { id: true } }),
      prisma.cooperativeStatus.create({
        data: { code: `${prefix}-CS`, name: "Cal status", sortOrder: 1 },
        select: { id: true },
      }),
      prisma.accreditationStatus.create({
        data: { code: `${prefix}-ACC`, name: "Cal accreditation", sortOrder: 1 },
        select: { id: true },
      }),
    ]);
    if (!sector || !barangay) {
      throw new Error("OCCDO-016 seed sectors/barangays are required");
    }
    actorId = actor.id;
    const coop = await createCooperative({
      actorId,
      input: {
        cooperativeCode: `${prefix}-A`,
        name: "Calendar Coop",
        registrationNumber: null,
        acronym: null,
        typeId: coopType.id,
        sectorId: sector.id,
        address: "Ormoc",
        barangayId: barangay.id,
        contactPerson: "Staff",
        contactNumber: "09170000000",
        email: null,
        dateRegistered: null,
        dateAccredited: null,
        accreditationStatusId: accreditation.id,
        statusId: coopStatus.id,
        totalMembers: 0,
        maleMembers: 0,
        femaleMembers: 0,
        remarks: null,
      },
    });
    cooperativeId = coop.id;
  });

  afterAll(async () => {
    await prisma.calendarActivity.deleteMany({
      where: { title: { startsWith: `${prefix}-` } },
    });
    await prisma.auditLog.deleteMany({ where: { actorId } });
    await prisma.cooperative.deleteMany({
      where: { cooperativeCode: { startsWith: `${prefix}-` } },
    });
    await prisma.cooperativeType.deleteMany({ where: { code: `${prefix}-CT` } });
    await prisma.cooperativeStatus.deleteMany({ where: { code: `${prefix}-CS` } });
    await prisma.accreditationStatus.deleteMany({ where: { code: `${prefix}-ACC` } });
    await prisma.user.deleteMany({ where: { email: actorEmail } });
    await prisma.$disconnect();
  });

  it("creates an activity, lists upcoming, and updates it", async () => {
    const created = await createCalendarActivity({
      actorId,
      input: createCalendarActivitySchema.parse({
        title: `${prefix}-meeting`,
        kind: "ACTIVITY",
        startAt: "2026-09-23T09:00",
        endAt: "2026-09-23T10:00",
        location: "OCCDO Hall",
        remarks: null,
        cooperativeId,
        trainingEventId: null,
      }),
    });

    expect(created.startAt.toISOString()).toBe("2026-09-23T01:00:00.000Z");
    expect(created.cooperative?.id).toBe(cooperativeId);

    const upcoming = await listUpcomingCalendarActivities({
      asOf: new Date("2026-09-23T00:00:00.000Z"),
      take: 10,
    });
    expect(upcoming.some((row) => row.id === created.id)).toBe(true);

    const past = await listUpcomingCalendarActivities({
      asOf: new Date("2026-09-24T00:00:00.000Z"),
      take: 10,
    });
    expect(past.some((row) => row.id === created.id)).toBe(false);

    const month = await listCalendarActivities({ year: 2026, month: 9 });
    expect(month.items.some((row) => row.title === `${prefix}-meeting`)).toBe(true);

    const updated = await updateCalendarActivity({
      actorId,
      input: {
        ...createCalendarActivitySchema.parse({
          title: `${prefix}-meeting-updated`,
          kind: "DEADLINE",
          startAt: "2026-09-23T11:00",
          cooperativeId,
        }),
        id: created.id,
      },
    });
    expect(updated.title).toBe(`${prefix}-meeting-updated`);
    expect(updated.kind).toBe("DEADLINE");

    const audit = await prisma.auditLog.findFirst({
      where: { entityId: created.id, action: "CALENDAR_ACTIVITY_CREATE" },
      select: { entityType: true, metadata: true },
    });
    expect(audit?.entityType).toBe("CalendarActivity");
    expect(JSON.stringify(audit?.metadata)).not.toContain("passwordHash");
    expect(JSON.stringify(audit?.metadata)).not.toContain("09170000000");
  });

  it("rejects an unknown cooperative link and returns an empty month", async () => {
    await expect(
      createCalendarActivity({
        actorId,
        input: createCalendarActivitySchema.parse({
          title: `${prefix}-bad-link`,
          kind: "ACTIVITY",
          startAt: "2026-09-23T09:00",
          cooperativeId: "missing-cooperative",
        }),
      }),
    ).rejects.toBeInstanceOf(CalendarActivityReferenceError);

    const empty = await listCalendarActivities({ year: 2025, month: 1 });
    expect(empty.items).toEqual([]);
    expect(empty.year).toBe(2025);
    expect(empty.month).toBe(1);
  });
});
