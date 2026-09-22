import type { CooperativeActionErrorCode } from "@/lib/actions/cooperatives";

export const COOPERATIVE_ACTION_ERROR_MESSAGE: Record<
  CooperativeActionErrorCode,
  string
> = {
  UNAUTHORIZED: "Sign in to continue.",
  FORBIDDEN: "You do not have permission to change cooperatives.",
  RATE_LIMITED: "Too many requests. Try again later.",
  VALIDATION: "Check the form values and try again.",
  CONFLICT: "That cooperative code or registration number is already in use.",
  NOT_FOUND: "Cooperative was not found.",
};
