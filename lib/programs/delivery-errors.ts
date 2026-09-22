import type { ServiceDeliveryActionErrorCode } from "@/lib/actions/service-deliveries";

export const SERVICE_DELIVERY_ACTION_ERROR_MESSAGE: Record<
  ServiceDeliveryActionErrorCode,
  string
> = {
  UNAUTHORIZED: "Sign in to continue.",
  FORBIDDEN: "You do not have permission to record service deliveries.",
  RATE_LIMITED: "Too many requests. Try again later.",
  VALIDATION: "Check the form values and try again.",
  CONFLICT: "That service delivery could not be saved.",
  NOT_FOUND: "Cooperative was not found.",
};
