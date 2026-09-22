import { describe, expect, it } from "vitest";

import { mapLoginError } from "@/lib/auth/login-errors";
import { RateLimitError } from "@/lib/rate-limit";

describe("mapLoginError", () => {
  it("maps RateLimitError to RATE_LIMITED", () => {
    expect(mapLoginError(new RateLimitError())).toBe("RATE_LIMITED");
  });

  it("maps unknown failures to INVALID_CREDENTIALS", () => {
    expect(mapLoginError(new Error("nope"))).toBe("INVALID_CREDENTIALS");
    expect(mapLoginError("nope")).toBe("INVALID_CREDENTIALS");
  });
});
