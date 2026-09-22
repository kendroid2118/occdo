import { describe, expect, it } from "vitest";

import { isSecretMetadataKey, redactAuditMetadata } from "@/lib/dal/audit-redact";

describe("redactAuditMetadata", () => {
  it("redacts password-like and token keys at any depth", () => {
    const redacted = redactAuditMetadata({
      action: "USER_UPDATE",
      password: "plaintext-must-not-persist",
      passwordHash: "$2a$should-not-persist",
      before: {
        access_token: "tok-1",
        nested: { sessionToken: "sess-1", email: "staff@example.invalid" },
      },
      cookies: ["authjs.session-token=abc"],
    });

    expect(redacted).toEqual({
      action: "USER_UPDATE",
      password: "[REDACTED]",
      passwordHash: "[REDACTED]",
      before: {
        access_token: "[REDACTED]",
        nested: { sessionToken: "[REDACTED]", email: "staff@example.invalid" },
      },
      cookies: "[REDACTED]",
    });
  });

  it("identifies secret keys without treating ordinary fields as secrets", () => {
    expect(isSecretMetadataKey("passwordHash")).toBe(true);
    expect(isSecretMetadataKey("AUTH_SECRET")).toBe(true);
    expect(isSecretMetadataKey("email")).toBe(false);
    expect(isSecretMetadataKey("role")).toBe(false);
  });
});
