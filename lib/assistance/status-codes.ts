export const ASSISTANCE_STATUS_CODES = {
  REQUESTED: "REQUESTED",
  APPROVED: "APPROVED",
  RELEASED: "RELEASED",
} as const;

export type AssistanceStatusCode =
  (typeof ASSISTANCE_STATUS_CODES)[keyof typeof ASSISTANCE_STATUS_CODES];
