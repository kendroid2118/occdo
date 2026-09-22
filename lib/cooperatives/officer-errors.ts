import type { OfficerActionErrorCode } from "@/lib/actions/officers";

export const OFFICER_ACTION_ERROR_MESSAGE: Record<OfficerActionErrorCode, string> = {
  UNAUTHORIZED: "Sign in to continue.",
  FORBIDDEN: "You cannot change officers for another cooperative.",
  RATE_LIMITED: "Too many requests. Try again later.",
  VALIDATION: "Check the officer form values and try again.",
  CONFLICT: "That officer record conflicts with an existing one.",
  NOT_FOUND: "Officer was not found.",
};
