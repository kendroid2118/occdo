import type { AccreditationActionErrorCode } from "@/lib/actions/accreditation";

export const ACCREDITATION_ACTION_ERROR_MESSAGE: Record<
  AccreditationActionErrorCode,
  string
> = {
  UNAUTHORIZED: "Sign in to continue.",
  FORBIDDEN: "You do not have permission to change accreditation cases.",
  RATE_LIMITED: "Too many requests. Try again later.",
  VALIDATION: "Check the form values and try again.",
  CONFLICT: "That accreditation case could not be saved.",
  NOT_FOUND: "Accreditation case was not found.",
};
