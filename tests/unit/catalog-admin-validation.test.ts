import { describe, expect, it } from "vitest";

import {
  createCatalogAdminItemSchema,
  updateCatalogAdminItemSchema,
  upsertCdaPortalUrlSchema,
} from "@/lib/validation/catalog-admin";

describe("catalog admin validation", () => {
  it("accepts a sector create payload", () => {
    const parsed = createCatalogAdminItemSchema.parse({
      kind: "sector",
      code: "E2E-S",
      name: "E2E Sector",
      sortOrder: "10",
    });
    expect(parsed.isActive).toBe(true);
    expect(parsed.sortOrder).toBe(10);
  });

  it("rejects an unknown catalog kind or invalid CDA URL", () => {
    expect(
      createCatalogAdminItemSchema.safeParse({
        kind: "holiday",
        code: "X",
        name: "X",
      }).success,
    ).toBe(false);
    expect(upsertCdaPortalUrlSchema.safeParse({ value: "javascript:alert(1)" }).success).toBe(
      false,
    );
    expect(upsertCdaPortalUrlSchema.parse({ value: "https://cda.gov.ph" }).value).toBe(
      "https://cda.gov.ph",
    );
    expect(upsertCdaPortalUrlSchema.parse({ value: "" }).value).toBe("");
  });

  it("accepts a deactivate update", () => {
    const parsed = updateCatalogAdminItemSchema.parse({
      kind: "type",
      id: "type-1",
      code: "OLD",
      name: "Old type",
      isActive: "false",
    });
    expect(parsed.isActive).toBe(false);
  });
});
