import type { DocumentActionErrorCode } from "@/lib/actions/documents";

export const DOCUMENT_ACTION_ERROR_MESSAGE: Record<DocumentActionErrorCode, string> = {
  UNAUTHORIZED: "Sign in to continue.",
  FORBIDDEN: "You do not have permission to change documents.",
  RATE_LIMITED: "Too many requests. Try again later.",
  VALIDATION: "The request could not be completed. Check the file or verification status.",
  CONFLICT: "That document type code is already in use.",
  NOT_FOUND: "Document, document type, or cooperative was not found.",
};
