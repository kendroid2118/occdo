import { describe, expect, it } from "vitest";

import {
  createCooperativeSchema,
  listCooperativesSchema,
} from "@/lib/validation/cooperative";

const validWrite = {
  cooperativeCode: "OCC-018-A",
  registrationNumber: "  ",
  name: "Test Cooperative",
  typeId: "type-1",
  sectorId: "sector-1",
  address: "Ormoc",
  barangayId: "brgy-1",
  contactPerson: "Staff",
  contactNumber: "09170000000",
  accreditationStatusId: "acc-1",
  statusId: "status-1",
  totalMembers: 0,
  maleMembers: 0,
  femaleMembers: 0,
};

describe("cooperative schemas", () => {
  it("accepts a write payload and nulls a blank registration number", () => {
    const parsed = createCooperativeSchema.parse({
      ...validWrite,
      extraField: "must-not-assign",
    });

    expect(parsed.registrationNumber).toBeNull();
    expect(parsed).not.toHaveProperty("extraField");
    expect(parsed.totalMembers).toBe(0);
  });

  it("rejects negative membership counts", () => {
    expect(() =>
      createCooperativeSchema.parse({
        ...validWrite,
        totalMembers: -1,
      }),
    ).toThrow();
    expect(() =>
      createCooperativeSchema.parse({
        ...validWrite,
        maleMembers: -1,
      }),
    ).toThrow();
  });

  it("rejects an empty cooperative code", () => {
    expect(() =>
      createCooperativeSchema.parse({
        ...validWrite,
        cooperativeCode: "   ",
      }),
    ).toThrow();
  });

  it("applies list pagination defaults and keeps filter ids", () => {
    const parsed = listCooperativesSchema.parse({
      typeId: "type-1",
      search: "  occ  ",
    });

    expect(parsed.page).toBe(1);
    expect(parsed.pageSize).toBe(20);
    expect(parsed.typeId).toBe("type-1");
    expect(parsed.search).toBe("occ");
    expect(listCooperativesSchema.parse({ typeId: "", page: "2" })).toMatchObject({
      typeId: undefined,
      page: 2,
    });
  });
});
