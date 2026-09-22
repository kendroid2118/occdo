import type { TrainingParticipantActionErrorCode } from "@/lib/actions/training-participants";

export const TRAINING_PARTICIPANT_ACTION_ERROR_MESSAGE: Record<
  TrainingParticipantActionErrorCode,
  string
> = {
  UNAUTHORIZED: "Sign in to continue.",
  FORBIDDEN: "You do not have permission to add participants.",
  RATE_LIMITED: "Too many requests. Try again later.",
  VALIDATION: "Check the form values and try again.",
  CONFLICT: "That participant could not be saved.",
  NOT_FOUND: "Training event or cooperative was not found.",
};

export const ATTENDANCE_STATUS_LABEL: Record<string, string> = {
  REGISTERED: "Registered",
  PRESENT: "Present",
  ABSENT: "Absent",
};
