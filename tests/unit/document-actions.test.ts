import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import type { SessionUser } from "@/lib/auth/session";

const getCurrentSessionUser = vi.fn();

vi.mock("@/lib/auth/current-session", () => ({
  getCurrentSessionUser: () => getCurrentSessionUser(),
}));

import {
  createDocumentTypeAction,
  uploadDocumentAction,
} from "@/lib/actions/documents";
import { MAX_DOCUMENT_BYTES } from "@/lib/documents/mime";
import { resetRateLimitStateForTests } from "@/lib/rate-limit";

const staffUser: SessionUser = {
  id: "occdo-033-user",
  email: "user.033@example.invalid",
  name: "Staff User",
  role: "USER",
  isActive: true,
};

const adminUser: SessionUser = {
  id: "occdo-033-admin",
  email: "admin.033@example.invalid",
  name: "Admin User",
  role: "ADMIN",
  isActive: true,
};

const pdfBytes = Uint8Array.from(Buffer.from("%PDF-1.4\n"));

describe("document write actions", () => {
  beforeEach(() => {
    resetRateLimitStateForTests();
    getCurrentSessionUser.mockReset();
  });

  it("forbids USER from uploading a document", async () => {
    getCurrentSessionUser.mockResolvedValue(staffUser);

    const result = await uploadDocumentAction({
      cooperativeId: "coop-1",
      documentTypeId: "type-1",
      fileName: "report.pdf",
      fileBytes: pdfBytes,
    });

    expect(result).toEqual({ ok: false, code: "FORBIDDEN" });
  });

  it("forbids USER from creating a document type", async () => {
    getCurrentSessionUser.mockResolvedValue(staffUser);

    const result = await createDocumentTypeAction({
      code: "DEMO-FORBIDDEN",
      name: "Forbidden type",
    });

    expect(result).toEqual({ ok: false, code: "FORBIDDEN" });
  });

  it("rejects disallowed file types for an authorized uploader", async () => {
    getCurrentSessionUser.mockResolvedValue(adminUser);

    const result = await uploadDocumentAction({
      cooperativeId: "coop-1",
      documentTypeId: "type-1",
      fileName: "page.html",
      fileBytes: Buffer.from("<!DOCTYPE html><html></html>"),
    });

    expect(result).toEqual({ ok: false, code: "VALIDATION" });
  });

  it("rejects oversized files for an authorized uploader", async () => {
    getCurrentSessionUser.mockResolvedValue(adminUser);
    const oversized = new Uint8Array(MAX_DOCUMENT_BYTES + 1);
    oversized.set(pdfBytes, 0);

    const result = await uploadDocumentAction({
      cooperativeId: "coop-1",
      documentTypeId: "type-1",
      fileName: "huge.pdf",
      fileBytes: oversized,
    });

    expect(result).toEqual({ ok: false, code: "VALIDATION" });
  });

  it("rejects unauthenticated uploads", async () => {
    getCurrentSessionUser.mockResolvedValue(null);

    const result = await uploadDocumentAction({
      cooperativeId: "coop-1",
      documentTypeId: "type-1",
      fileName: "report.pdf",
      fileBytes: pdfBytes,
    });

    expect(result).toEqual({ ok: false, code: "UNAUTHORIZED" });
  });
});
