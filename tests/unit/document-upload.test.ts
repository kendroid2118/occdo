import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  DocumentPathError,
  attachmentContentDisposition,
  generateStoredFilename,
  isSafeStoredFilename,
  sanitizeOriginalFilename,
} from "@/lib/documents/filename";
import { inspectDocumentUpload } from "@/lib/documents/inspect";
import {
  DocumentUploadValidationError,
  MAX_DOCUMENT_BYTES,
  sniffDocumentMimeType,
} from "@/lib/documents/mime";
import {
  DocumentStorageConfigError,
  assertAllowedStorageRoot,
  resolveDocumentStoragePath,
} from "@/lib/documents/storage-path";

const pdfBytes = Uint8Array.from(Buffer.from("%PDF-1.4\n1 0 obj\n"));
const jpegBytes = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
const pngBytes = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);

describe("document filename generation", () => {
  it("generates a UUID stored name with an allowed extension", () => {
    const stored = generateStoredFilename("pdf");
    expect(stored).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.pdf$/,
    );
    expect(isSafeStoredFilename(stored)).toBe(true);
    expect(stored).not.toContain("report.pdf");
  });

  it("never uses the original filename as a storage path", () => {
    const inspected = inspectDocumentUpload({
      bytes: pdfBytes,
      originalFilename: "report.pdf",
    });
    const stored = generateStoredFilename(inspected.extension);
    expect(stored).not.toBe("report.pdf");
    expect(stored.endsWith(".pdf")).toBe(true);
    expect(inspected.originalFilename).toBe("report.pdf");
  });
});

describe("document type rejection", () => {
  it("rejects HTML, JavaScript, and executable payloads", () => {
    expect(() => sniffDocumentMimeType(Buffer.from("<!DOCTYPE html><html></html>"))).toThrow(
      DocumentUploadValidationError,
    );
    expect(() => sniffDocumentMimeType(Buffer.from("<script>alert(1)</script>"))).toThrow(
      DocumentUploadValidationError,
    );
    expect(() => sniffDocumentMimeType(Buffer.from("console.log(1)"))).toThrow(
      DocumentUploadValidationError,
    );
    expect(() => sniffDocumentMimeType(Buffer.from("MZ"))).toThrow(DocumentUploadValidationError);
  });

  it("rejects a spoofed PDF extension when the bytes are HTML", () => {
    expect(() =>
      inspectDocumentUpload({
        bytes: Buffer.from("<html>not a pdf</html>"),
        originalFilename: "report.pdf",
      }),
    ).toThrow(DocumentUploadValidationError);
  });

  it("rejects a client JPEG extension when the bytes are PNG", () => {
    expect(() =>
      inspectDocumentUpload({
        bytes: pngBytes,
        originalFilename: "photo.jpg",
      }),
    ).toThrow(DocumentPathError);
  });

  it("accepts sniffed PDF, JPEG, and PNG bytes", () => {
    expect(sniffDocumentMimeType(pdfBytes)).toBe("application/pdf");
    expect(sniffDocumentMimeType(jpegBytes)).toBe("image/jpeg");
    expect(sniffDocumentMimeType(pngBytes)).toBe("image/png");
  });
});

describe("document size and traversal", () => {
  it("rejects oversized files before type sniffing can accept them", () => {
    const oversized = new Uint8Array(MAX_DOCUMENT_BYTES + 1);
    oversized.set(pdfBytes, 0);
    expect(() =>
      inspectDocumentUpload({
        bytes: oversized,
        originalFilename: "huge.pdf",
      }),
    ).toThrow(DocumentUploadValidationError);
  });

  it("strips traversal-style original filenames to a basename", () => {
    const inspected = inspectDocumentUpload({
      bytes: pdfBytes,
      originalFilename: "..\\..\\windows\\system32\\report.pdf",
    });
    expect(inspected.originalFilename).toBe("report.pdf");
    expect(inspected.originalFilename).not.toContain("..");
    expect(inspected.originalFilename).not.toContain("\\");
    expect(sanitizeOriginalFilename("../../etc/passwd.pdf")).toBe("passwd.pdf");
  });

  it("rejects traversal-style stored filenames", () => {
    expect(isSafeStoredFilename("../x.pdf")).toBe(false);
    expect(isSafeStoredFilename("..\\x.pdf")).toBe(false);
    expect(isSafeStoredFilename("a/b.pdf")).toBe(false);
    expect(isSafeStoredFilename("not-a-uuid.pdf")).toBe(false);
    expect(() => resolveDocumentStoragePath("/tmp/docs", "../x.pdf")).toThrow(DocumentPathError);
  });

  it("rejects storage roots inside public or app", () => {
    const cwd = process.cwd();
    expect(() => assertAllowedStorageRoot(path.join(cwd, "public"))).toThrow(
      DocumentStorageConfigError,
    );
    expect(() => assertAllowedStorageRoot(path.join(cwd, "public", "uploads"))).toThrow(
      DocumentStorageConfigError,
    );
    expect(() => assertAllowedStorageRoot(path.join(cwd, "app"))).toThrow(
      DocumentStorageConfigError,
    );
    expect(assertAllowedStorageRoot(path.join(cwd, "storage", "documents"))).toBe(
      path.resolve(cwd, "storage", "documents"),
    );
  });

  it("uses a safe Content-Disposition filename without path segments", () => {
    const header = attachmentContentDisposition("..\\evil.pdf");
    expect(header).toContain('filename="evil.pdf"');
    expect(header).toContain("filename*=UTF-8''evil.pdf");
    expect(header).not.toContain("..");
    expect(header.startsWith("attachment;")).toBe(true);
  });
});
