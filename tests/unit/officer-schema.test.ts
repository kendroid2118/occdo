import { describe, expect, it } from "vitest";

import {
  createOfficerSchema,
  deleteOfficerSchema,
  updateOfficerSchema,
} from "@/lib/validation/officer";

const validCreate = {
  cooperativeId: "coop-1",
  positionId: "pos-1",
  fullName: "Maria Santos",
};

describe("officer schemas", () => {
  it("accepts a create payload and defaults primary contact to false", () => {
    const parsed = createOfficerSchema.parse({
      ...validCreate,
      extraField: "nope",
    });

    expect(parsed.isPrimaryContact).toBe(false);
    expect(parsed.isActive).toBe(true);
    expect(parsed.email).toBeNull();
    expect(parsed).not.toHaveProperty("extraField");
  });

  it("rejects an empty full name and invalid email", () => {
    expect(() =>
      createOfficerSchema.parse({
        ...validCreate,
        fullName: "   ",
      }),
    ).toThrow();
    expect(() =>
      createOfficerSchema.parse({
        ...validCreate,
        email: "not-an-email",
      }),
    ).toThrow();
  });

  it("treats checkbox values and requires ids for update/delete", () => {
    const updated = updateOfficerSchema.parse({
      ...validCreate,
      id: "officer-1",
      isPrimaryContact: "on",
    });
    expect(updated.isPrimaryContact).toBe(true);
    expect(() => deleteOfficerSchema.parse({ id: "officer-1" })).toThrow();
    expect(deleteOfficerSchema.parse({ id: "officer-1", cooperativeId: "coop-1" })).toEqual({
      id: "officer-1",
      cooperativeId: "coop-1",
    });
  });
});
