import { describe, expect, it } from "vitest";

import {
  createTrainingEventSchema,
  listTrainingEventsSchema,
  updateTrainingEventSchema,
} from "@/lib/validation/training-event";

const validWrite = {
  title: "GA Training",
  kind: "TRAINING",
  startAt: "2026-09-22",
  venue: "OCCDO Hall",
};

describe("training event schemas", () => {
  it("accepts a create payload and nulls a blank remarks field", () => {
    const parsed = createTrainingEventSchema.parse({
      ...validWrite,
      remarks: "  ",
      extraField: "must-not-assign",
    });

    expect(parsed.title).toBe("GA Training");
    expect(parsed.kind).toBe("TRAINING");
    expect(parsed.startAt).toBeInstanceOf(Date);
    expect(parsed.remarks).toBeNull();
    expect(parsed).not.toHaveProperty("extraField");
  });

  it("rejects an empty title, invalid kind, and end date before start", () => {
    expect(() =>
      createTrainingEventSchema.parse({
        ...validWrite,
        title: "   ",
      }),
    ).toThrow();
    expect(() =>
      createTrainingEventSchema.parse({
        ...validWrite,
        kind: "WORKSHOP",
      }),
    ).toThrow();
    expect(() =>
      createTrainingEventSchema.parse({
        ...validWrite,
        endAt: "2026-09-21",
      }),
    ).toThrow();
  });

  it("requires an id for update and applies list defaults", () => {
    expect(() => updateTrainingEventSchema.parse(validWrite)).toThrow();
    const updated = updateTrainingEventSchema.parse({
      ...validWrite,
      id: "event-1",
      endAt: "2026-09-23",
    });
    expect(updated.id).toBe("event-1");

    const listed = listTrainingEventsSchema.parse({ kind: "SEMINAR" });
    expect(listed.page).toBe(1);
    expect(listed.pageSize).toBe(20);
    expect(listed.kind).toBe("SEMINAR");
    expect(listTrainingEventsSchema.parse({ kind: "" }).kind).toBeUndefined();
  });
});
