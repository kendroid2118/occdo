import type { TrainingEventActionErrorCode } from "@/lib/actions/training-events";

export const TRAINING_EVENT_ACTION_ERROR_MESSAGE: Record<
  TrainingEventActionErrorCode,
  string
> = {
  UNAUTHORIZED: "Sign in to continue.",
  FORBIDDEN: "You do not have permission to change training events.",
  RATE_LIMITED: "Too many requests. Try again later.",
  VALIDATION: "Check the form values and try again.",
  CONFLICT: "That training event could not be saved.",
  NOT_FOUND: "Training event was not found.",
};

export const TRAINING_KIND_LABEL: Record<string, string> = {
  TRAINING: "Training",
  SEMINAR: "Seminar",
  ORIENTATION: "Orientation",
};
