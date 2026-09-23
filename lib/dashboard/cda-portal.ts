import "server-only";

import { env } from "@/lib/env";

export function getCdaPortalUrl(): string | null {
  const url = env.CDA_PORTAL_URL;
  if (!url) {
    return null;
  }
  if (!url.startsWith("https://") && !url.startsWith("http://")) {
    return null;
  }
  return url;
}
