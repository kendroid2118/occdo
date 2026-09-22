import type { ComplianceActionErrorCode } from "@/lib/actions/compliance-records";

export const COMPLIANCE_ACTION_ERROR_MESSAGE: Record<ComplianceActionErrorCode, string> = {
  UNAUTHORIZED: "Sign in to continue.",
  FORBIDDEN: "You do not have permission to change compliance records.",
  RATE_LIMITED: "Too many requests. Try again later.",
  VALIDATION: "Check the form values and try again.",
  CONFLICT: "A compliance record already exists for this period.",
  NOT_FOUND: "Compliance record or cooperative was not found.",
};
