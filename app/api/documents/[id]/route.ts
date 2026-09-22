import { NextResponse } from "next/server";

import { getCurrentSessionUser } from "@/lib/auth/current-session";
import { AuthzError, requireRole } from "@/lib/auth/rbac";
import { AUTH_ROLES } from "@/lib/auth/roles";
import type { SessionUser } from "@/lib/auth/session";
import { getCooperativeDocumentForDownload } from "@/lib/dal/documents";
import { attachmentContentDisposition } from "@/lib/documents/filename";
import { RateLimitError, assertActionRateLimit } from "@/lib/rate-limit";
import { readDocumentFile } from "@/lib/storage/documents";
import { getDocumentSchema } from "@/lib/validation/document";

export const runtime = "nodejs";

function emptyStatus(status: number): NextResponse {
  return new NextResponse(null, { status });
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const user = await getCurrentSessionUser();
  let sessionUser: SessionUser;

  try {
    sessionUser = requireRole(user, AUTH_ROLES);
  } catch (error: unknown) {
    if (error instanceof AuthzError) {
      return emptyStatus(error.code === "UNAUTHORIZED" ? 401 : 403);
    }
    throw error;
  }

  try {
    await assertActionRateLimit(`action:${sessionUser.id}`);
  } catch (error: unknown) {
    if (error instanceof RateLimitError) {
      return emptyStatus(429);
    }
    throw error;
  }

  const { id } = await context.params;
  const parsed = getDocumentSchema.safeParse({ id });
  if (!parsed.success) {
    return emptyStatus(400);
  }

  const record = await getCooperativeDocumentForDownload(parsed.data.id);
  if (!record) {
    return emptyStatus(404);
  }

  try {
    const bytes = await readDocumentFile(record.storedFilename);
    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: {
        "Content-Type": record.mimeType,
        "Content-Disposition": attachmentContentDisposition(record.originalFilename),
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-store",
        "Content-Length": String(bytes.byteLength),
      },
    });
  } catch {
    return emptyStatus(404);
  }
}
