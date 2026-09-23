import { describe, expect, it } from "vitest";

import {
  HSTS_VALUE,
  SECURITY_HEADER_SOURCE,
  buildSecurityHeaders,
  securityHeaderEntries,
} from "@/lib/security/headers";

function headerMap(isProduction: boolean): Map<string, string> {
  return new Map(buildSecurityHeaders(isProduction).map((header) => [header.key, header.value]));
}

describe("buildSecurityHeaders", () => {
  it("includes the required headers in production, including HSTS", () => {
    const headers = headerMap(true);

    expect(headers.get("Content-Security-Policy")).toContain("default-src 'self'");
    expect(headers.get("Content-Security-Policy")).toContain("object-src 'none'");
    expect(headers.get("Content-Security-Policy")).toContain("frame-ancestors 'none'");
    expect(headers.get("Content-Security-Policy")).toContain("upgrade-insecure-requests");
    expect(headers.get("Content-Security-Policy")).not.toContain("unsafe-eval");
    expect(headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(headers.get("Permissions-Policy")).toContain("camera=()");
    expect(headers.get("Strict-Transport-Security")).toBe(HSTS_VALUE);
  });

  it("omits HSTS and HTTPS upgrades for local HTTP / non-production", () => {
    const headers = headerMap(false);

    expect(headers.has("Strict-Transport-Security")).toBe(false);
    expect(headers.get("Content-Security-Policy")).not.toContain("upgrade-insecure-requests");
    expect(headers.get("Content-Security-Policy")).toContain("unsafe-eval");
    expect(headers.get("Content-Security-Policy")).toContain("ws:");
    expect(headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(headers.get("Permissions-Policy")).toContain("geolocation=()");
  });
});

describe("securityHeaderEntries", () => {
  it("applies production headers to every path", () => {
    const entries = securityHeaderEntries(true);
    expect(entries).toHaveLength(1);
    expect(entries[0]?.source).toBe(SECURITY_HEADER_SOURCE);
    expect(entries[0]?.headers.some((header) => header.key === "Strict-Transport-Security")).toBe(
      true,
    );
  });
});
