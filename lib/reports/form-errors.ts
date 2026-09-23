import type { ReportActionErrorCode } from "@/lib/actions/reports";

export const REPORT_ACTION_ERROR_MESSAGE: Record<ReportActionErrorCode, string> = {
  UNAUTHORIZED: "Sign in to continue.",
  FORBIDDEN: "You do not have permission to view reports.",
  RATE_LIMITED: "Too many requests. Try again later.",
  VALIDATION: "Check the report filters and try again.",
};
