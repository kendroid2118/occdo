import type { MembershipActionErrorCode } from "@/lib/actions/membership";

export const MEMBERSHIP_ACTION_ERROR_MESSAGE: Record<
  MembershipActionErrorCode,
  string
> = {
  UNAUTHORIZED: "Sign in to continue.",
  FORBIDDEN: "You do not have permission to change membership counts.",
  RATE_LIMITED: "Too many requests. Try again later.",
  VALIDATION: "Membership counts must be zero or greater.",
  NOT_FOUND: "Cooperative was not found.",
};
