import type { CalendarActionErrorCode } from "@/lib/actions/calendar";

export const CALENDAR_ACTION_ERROR_MESSAGE: Record<CalendarActionErrorCode, string> = {
  UNAUTHORIZED: "Sign in to continue.",
  FORBIDDEN: "You do not have permission to change calendar activities.",
  RATE_LIMITED: "Too many requests. Try again later.",
  VALIDATION: "Check the activity values and try again.",
  NOT_FOUND: "Calendar activity was not found.",
};

export const CALENDAR_KIND_LABEL = {
  ACTIVITY: "Activity",
  TRAINING: "Training",
  DEADLINE: "Deadline",
} as const;
