import type { AnnouncementActionErrorCode } from "@/lib/actions/announcements";

export const ANNOUNCEMENT_ACTION_ERROR_MESSAGE: Record<AnnouncementActionErrorCode, string> = {
  UNAUTHORIZED: "Sign in to continue.",
  FORBIDDEN: "You do not have permission to publish announcements.",
  RATE_LIMITED: "Too many requests. Try again later.",
  VALIDATION: "Check the announcement values and try again.",
};
