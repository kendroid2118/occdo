import { RateLimitError } from "@/lib/rate-limit";

export type LoginErrorCode = "INVALID_CREDENTIALS" | "RATE_LIMITED" | "VALIDATION";

export type LoginResult =
  | { ok: true }
  | { ok: false; code: LoginErrorCode };

export const LOGIN_ERROR_MESSAGE: Record<LoginErrorCode, string> = {
  INVALID_CREDENTIALS: "Invalid email or password.",
  RATE_LIMITED: "Too many attempts. Try again later.",
  VALIDATION: "Enter a valid email and password.",
};

export function mapLoginError(error: unknown): LoginErrorCode {
  if (error instanceof RateLimitError) {
    return "RATE_LIMITED";
  }

  return "INVALID_CREDENTIALS";
}
