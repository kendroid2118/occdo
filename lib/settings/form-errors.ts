import type { CatalogActionErrorCode } from "@/lib/actions/catalog-admin";
import type { SystemConfigActionErrorCode } from "@/lib/actions/system-config";

export const CATALOG_ACTION_ERROR_MESSAGE: Record<CatalogActionErrorCode, string> = {
  UNAUTHORIZED: "Sign in to continue.",
  FORBIDDEN: "You do not have permission to maintain reference data.",
  RATE_LIMITED: "Too many requests. Try again later.",
  VALIDATION: "Check the catalog values and try again.",
  NOT_FOUND: "That catalog item was not found.",
  CONFLICT: "That catalog code is already in use.",
};

export const SYSTEM_CONFIG_ACTION_ERROR_MESSAGE: Record<SystemConfigActionErrorCode, string> = {
  UNAUTHORIZED: "Sign in to continue.",
  FORBIDDEN: "You do not have permission to change system configuration.",
  RATE_LIMITED: "Too many requests. Try again later.",
  VALIDATION: "Check the CDA Portal URL and try again.",
};
