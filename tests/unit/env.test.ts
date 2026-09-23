import { describe, expect, it } from "vitest";

import { parseEnv } from "@/lib/env/schema";

const valid = {
  NODE_ENV: "test",
  DATABASE_URL: "postgresql://occdo:occdo@localhost:5432/occdo",
  AUTH_SECRET: "test-auth-secret-must-be-at-least-32-chars",
} as const;

describe("parseEnv", () => {
  it("accepts required development variables", () => {
    const env = parseEnv(valid);
    expect(env.DATABASE_URL).toContain("postgresql://");
    expect(env.AUTH_SECRET.length).toBeGreaterThanOrEqual(32);
  });

  it("rejects missing DATABASE_URL", () => {
    expect(() =>
      parseEnv({
        ...valid,
        DATABASE_URL: undefined,
      }),
    ).toThrow();
  });

  it("rejects a short AUTH_SECRET", () => {
    expect(() =>
      parseEnv({
        ...valid,
        AUTH_SECRET: "too-short",
      }),
    ).toThrow();
  });

  it("treats an empty DOCUMENT_STORAGE_DIR as unset", () => {
    const env = parseEnv({
      ...valid,
      DOCUMENT_STORAGE_DIR: "",
    });
    expect(env.DOCUMENT_STORAGE_DIR).toBeUndefined();
  });

  it("accepts an optional CDA Portal URL and treats empty as unset", () => {
    expect(parseEnv(valid).CDA_PORTAL_URL).toBeUndefined();
    expect(
      parseEnv({
        ...valid,
        CDA_PORTAL_URL: "",
      }).CDA_PORTAL_URL,
    ).toBeUndefined();
    expect(
      parseEnv({
        ...valid,
        CDA_PORTAL_URL: "https://cda.gov.ph",
      }).CDA_PORTAL_URL,
    ).toBe("https://cda.gov.ph");
  });
});
