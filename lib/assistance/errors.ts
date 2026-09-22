import type { AssistanceActionErrorCode } from "@/lib/actions/assistance";

export const ASSISTANCE_ACTION_ERROR_MESSAGE: Record<
  AssistanceActionErrorCode,
  string
> = {
  UNAUTHORIZED: "Sign in to continue.",
  FORBIDDEN: "You do not have permission to change assistance records.",
  RATE_LIMITED: "Too many requests. Try again later.",
  VALIDATION: "Check the form values and try again.",
  CONFLICT: "That assistance record could not be saved.",
  NOT_FOUND: "Assistance record or cooperative was not found.",
};

export const FUND_LEDGER_ENTRY_KIND_LABEL: Record<string, string> = {
  DISBURSEMENT: "Disbursement",
  ADJUSTMENT: "Adjustment",
  RECOVERY: "Recovery",
};
