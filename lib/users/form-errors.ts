import type { UserActionErrorCode } from "@/lib/actions/users";

export const USER_ACTION_ERROR_MESSAGE: Record<UserActionErrorCode, string> = {
  UNAUTHORIZED: "Sign in to continue.",
  FORBIDDEN: "You do not have permission to manage that user or role.",
  RATE_LIMITED: "Too many requests. Try again later.",
  VALIDATION: "Check the user values and try again.",
  NOT_FOUND: "User was not found.",
  CONFLICT: "That email is already in use, or the last SUPER_ADMIN cannot be removed.",
};
