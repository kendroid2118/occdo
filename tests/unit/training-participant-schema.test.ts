import { describe, expect, it } from "vitest";

import { createTrainingParticipantSchema } from "@/lib/validation/training-participant";

const validWrite = {
  trainingEventId: "event-1",
  fullName: "Ana Reyes",
  attendanceStatus: "PRESENT",
};

describe("training participant schemas", () => {
  it("accepts a walk-in create payload and omits extra fields", () => {
    const parsed = createTrainingParticipantSchema.parse({
      ...validWrite,
      cooperativeId: "",
      contactNumber: " 09171234567 ",
      extraField: "must-not-assign",
    });

    expect(parsed.trainingEventId).toBe("event-1");
    expect(parsed.fullName).toBe("Ana Reyes");
    expect(parsed.cooperativeId).toBeUndefined();
    expect(parsed.contactNumber).toBe("09171234567");
    expect(parsed).not.toHaveProperty("extraField");
  });

  it("rejects an empty name and invalid attendance status", () => {
    expect(() =>
      createTrainingParticipantSchema.parse({
        ...validWrite,
        fullName: "   ",
      }),
    ).toThrow();
    expect(() =>
      createTrainingParticipantSchema.parse({
        ...validWrite,
        attendanceStatus: "MAYBE",
      }),
    ).toThrow();
  });
});
