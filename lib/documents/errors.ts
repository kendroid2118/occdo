import type { DocumentActionErrorCode } from "@/lib/actions/documents";

export const DOCUMENT_ACTION_ERROR_MESSAGE: Record<DocumentActionErrorCode, string> = {
  UNAUTHORIZED: "Sign in to continue.",
  FORBIDDEN: "You do not have permission to upload documents.",
  RATE_LIMITED: "Too many requests. Try again later.",
  VALIDATION: "The file could not be accepted. Use PDF, JPEG, or PNG up to 10 MB.",
  CONFLICT: "That document type code is already in use.",
  NOT_FOUND: "Document, document type, or cooperative was not found.",
};
