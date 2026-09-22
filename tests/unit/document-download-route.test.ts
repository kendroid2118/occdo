import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import type { SessionUser } from "@/lib/auth/session";

const getCurrentSessionUser = vi.fn();
const getCooperativeDocumentForDownload = vi.fn();
const readDocumentFile = vi.fn();

vi.mock("@/lib/auth/current-session", () => ({
  getCurrentSessionUser: () => getCurrentSessionUser(),
}));

vi.mock("@/lib/dal/documents", () => ({
  getCooperativeDocumentForDownload: (...args: unknown[]) =>
    getCooperativeDocumentForDownload(...args),
}));

vi.mock("@/lib/storage/documents", () => ({
  readDocumentFile: (...args: unknown[]) => readDocumentFile(...args),
}));

import { GET } from "@/app/api/documents/[id]/route";
import { resetRateLimitStateForTests } from "@/lib/rate-limit";

const adminUser: SessionUser = {
  id: "occdo-033-download-admin",
  email: "admin.download@example.invalid",
  name: "Admin",
  role: "ADMIN",
  isActive: true,
};

describe("document download route", () => {
  beforeEach(() => {
    resetRateLimitStateForTests();
    getCurrentSessionUser.mockReset();
    getCooperativeDocumentForDownload.mockReset();
    readDocumentFile.mockReset();
  });

  it("rejects unauthenticated retrieval", async () => {
    getCurrentSessionUser.mockResolvedValue(null);

    const response = await GET(new Request("http://127.0.0.1/api/documents/doc-1"), {
      params: Promise.resolve({ id: "doc-1" }),
    });

    expect(response.status).toBe(401);
    expect(getCooperativeDocumentForDownload).not.toHaveBeenCalled();
  });

  it("serves an authorized download with a safe Content-Disposition", async () => {
    getCurrentSessionUser.mockResolvedValue(adminUser);
    getCooperativeDocumentForDownload.mockResolvedValue({
      id: "doc-1",
      storedFilename: "11111111-1111-4111-8111-111111111111.pdf",
      originalFilename: "report.pdf",
      mimeType: "application/pdf",
      sizeBytes: 8,
    });
    readDocumentFile.mockResolvedValue(Buffer.from("%PDF-1.4"));

    const response = await GET(new Request("http://127.0.0.1/api/documents/doc-1"), {
      params: Promise.resolve({ id: "doc-1" }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/pdf");
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(response.headers.get("Content-Disposition")).toContain("attachment;");
    expect(response.headers.get("Content-Disposition")).toContain('filename="report.pdf"');
    expect(response.headers.get("Content-Disposition")).not.toContain("11111111");
  });
});
