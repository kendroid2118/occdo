import { describe, expect, it } from "vitest";

import { uploadDocumentSchema, verifyDocumentSchema } from "@/lib/validation/document";

const pdfBytes = Uint8Array.from(Buffer.from("%PDF-1.4\n"));

describe("document schemas", () => {
  it("rejects client-supplied verifier fields on verify", () => {
    const parsed = verifyDocumentSchema.parse({
      id: "doc-1",
      cooperativeId: "coop-1",
      verifiedById: "spoof-user",
      verifiedAt: "2020-01-01",
      verificationStatus: "VERIFIED",
    });

    expect(parsed).toEqual({ id: "doc-1", cooperativeId: "coop-1" });
    expect(parsed).not.toHaveProperty("verifiedById");
    expect(parsed).not.toHaveProperty("verifiedAt");
    expect(parsed).not.toHaveProperty("verificationStatus");
  });

  it("does not accept verifier identity on upload", () => {
    const parsed = uploadDocumentSchema.parse({
      cooperativeId: "coop-1",
      documentTypeId: "type-1",
      fileName: "report.pdf",
      fileBytes: pdfBytes,
      verifiedById: "spoof-user",
      storedFilename: "../../evil.pdf",
    });

    expect(parsed).not.toHaveProperty("verifiedById");
    expect(parsed).not.toHaveProperty("storedFilename");
  });
});
