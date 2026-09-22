import { Role } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { createCooperative } from "@/lib/dal/cooperatives";
import { prisma } from "@/lib/dal/prisma";
import { createTrainingEvent } from "@/lib/dal/training-events";
import {
  createTrainingParticipant,
  listParticipantsByEventId,
  listTrainingEventsByCooperativeId,
} from "@/lib/dal/training-participants";

const prefix = "occdo-028";
const actorEmail = `${prefix}-actor@example.invalid`;

describe("training participant DAL queries", () => {
  let actorId = "";
  let cooperativeAId = "";
  let cooperativeBId = "";
  let eventAId = "";
  let eventBId = "";

  beforeAll(async () => {
    await prisma.trainingParticipant.deleteMany({
      where: { trainingEvent: { title: { startsWith: `${prefix}-` } } },
    });
    await prisma.trainingEvent.deleteMany({
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
          name: "OCCDO-028 Actor",
          role: Role.ADMIN,
          isActive: true,
          passwordHash: "placeholder-hash-not-a-password",
        },
        select: { id: true },
      }),
      prisma.cooperativeType.create({
        data: { code: `${prefix}-CT`, name: "Type", sortOrder: 1 },
        select: { id: true },
      }),
      prisma.cooperativeSector.findFirst({
        where: { isActive: true },
        select: { id: true },
      }),
      prisma.barangay.findFirst({
        where: { isActive: true },
        select: { id: true },
      }),
      prisma.cooperativeStatus.create({
        data: { code: `${prefix}-CS`, name: "Status", sortOrder: 1 },
        select: { id: true },
      }),
      prisma.accreditationStatus.create({
        data: { code: `${prefix}-ACC`, name: "Accreditation", sortOrder: 1 },
        select: { id: true },
      }),
    ]);

    if (!sector || !barangay) {
      throw new Error("OCCDO-016 seed sectors/barangays are required");
    }

    actorId = actor.id;

    const coopInput = {
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
    };

    const [coopA, coopB] = await Promise.all([
      createCooperative({
        actorId,
        input: { ...coopInput, cooperativeCode: `${prefix}-A`, name: "Participant Coop A" },
      }),
      createCooperative({
        actorId,
        input: { ...coopInput, cooperativeCode: `${prefix}-B`, name: "Participant Coop B" },
      }),
    ]);
    cooperativeAId = coopA.id;
    cooperativeBId = coopB.id;

    const [eventA, eventB] = await Promise.all([
      createTrainingEvent({
        actorId,
        input: {
          title: `${prefix}-Event-A`,
          kind: "TRAINING",
          startAt: new Date("2026-09-10T00:00:00.000Z"),
          venue: "Hall A",
          remarks: null,
        },
      }),
      createTrainingEvent({
        actorId,
        input: {
          title: `${prefix}-Event-B`,
          kind: "SEMINAR",
          startAt: new Date("2026-09-20T00:00:00.000Z"),
          venue: "Hall B",
          remarks: null,
        },
      }),
    ]);
    eventAId = eventA.id;
    eventBId = eventB.id;

    await createTrainingParticipant({
      actorId,
      input: {
        trainingEventId: eventAId,
        cooperativeId: cooperativeAId,
        fullName: "Alice A",
        attendanceStatus: "PRESENT",
        contactNumber: "09170000001",
      },
    });
    await createTrainingParticipant({
      actorId,
      input: {
        trainingEventId: eventAId,
        cooperativeId: null,
        fullName: "Bob Walk-in",
        attendanceStatus: "REGISTERED",
        contactNumber: "09170000002",
      },
    });
    await createTrainingParticipant({
      actorId,
      input: {
        trainingEventId: eventBId,
        cooperativeId: cooperativeAId,
        fullName: "Carol A",
        attendanceStatus: "ABSENT",
        contactNumber: null,
      },
    });
    await createTrainingParticipant({
      actorId,
      input: {
        trainingEventId: eventBId,
        cooperativeId: cooperativeBId,
        fullName: "Dave B",
        attendanceStatus: "PRESENT",
        contactNumber: null,
      },
    });
  });

  afterAll(async () => {
    await prisma.trainingParticipant.deleteMany({
      where: { trainingEvent: { title: { startsWith: `${prefix}-` } } },
    });
    await prisma.trainingEvent.deleteMany({
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

  it("lists participants for one event without contact numbers", async () => {
    const listed = await listParticipantsByEventId(eventAId);

    expect(listed.map((row) => row.fullName)).toEqual(["Alice A", "Bob Walk-in"]);
    expect(listed.every((row) => row.trainingEventId === eventAId)).toBe(true);
    expect(listed[0]?.cooperativeId).toBe(cooperativeAId);
    expect(listed[1]?.cooperativeId).toBeNull();
    expect(listed[0]).not.toHaveProperty("contactNumber");
    expect(JSON.stringify(listed)).not.toContain("09170000001");
    expect(JSON.stringify(listed)).not.toContain("09170000002");
  });

  it("lists training events for a cooperative without duplicating event fields on participants", async () => {
    const forA = await listTrainingEventsByCooperativeId(cooperativeAId);
    const forB = await listTrainingEventsByCooperativeId(cooperativeBId);

    expect(forA.map((row) => row.title).sort()).toEqual([
      `${prefix}-Event-A`,
      `${prefix}-Event-B`,
    ]);
    expect(forB.map((row) => row.title)).toEqual([`${prefix}-Event-B`]);
    expect(forA[0]).toHaveProperty("venue");
    expect(forA[0]).not.toHaveProperty("fullName");
    expect(forA[0]).not.toHaveProperty("contactNumber");
  });

  it("writes an audit log without contact numbers", async () => {
    const audit = await prisma.auditLog.findFirst({
      where: { actorId, action: "TRAINING_PARTICIPANT_CREATE" },
      select: { entityType: true, metadata: true },
    });
    expect(audit?.entityType).toBe("TrainingParticipant");
    expect(JSON.stringify(audit?.metadata)).not.toContain("09170000001");
    expect(JSON.stringify(audit?.metadata)).not.toContain("passwordHash");
  });
});
