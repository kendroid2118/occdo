export const DOCUMENT_VERIFICATION_STATUS = {
  UNVERIFIED: "UNVERIFIED",
  VERIFIED: "VERIFIED",
} as const;

export type DocumentVerificationStatus =
  (typeof DOCUMENT_VERIFICATION_STATUS)[keyof typeof DOCUMENT_VERIFICATION_STATUS];
