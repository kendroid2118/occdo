export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;

export const ALLOWED_DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
] as const;

export type AllowedDocumentMimeType = (typeof ALLOWED_DOCUMENT_MIME_TYPES)[number];

export type StoredDocumentExtension = "pdf" | "jpg" | "png";

export class DocumentUploadValidationError extends Error {
  readonly code = "VALIDATION" as const;

  constructor(message = "The file is not an allowed document type") {
    super(message);
    this.name = "DocumentUploadValidationError";
  }
}

const PDF_MAGIC = Buffer.from("%PDF");
const JPEG_MAGIC = Buffer.from([0xff, 0xd8, 0xff]);
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const EXE_MAGIC = Buffer.from("MZ");
const HTML_PREFIXES = ["<!doctype", "<html", "<script", "<svg"] as const;

const MIME_EXTENSIONS: Record<AllowedDocumentMimeType, readonly string[]> = {
  "application/pdf": ["pdf"],
  "image/jpeg": ["jpg", "jpeg"],
  "image/png": ["png"],
};

const MIME_STORED_EXTENSION: Record<AllowedDocumentMimeType, StoredDocumentExtension> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
};

function startsWithBytes(bytes: Uint8Array, magic: Uint8Array): boolean {
  if (bytes.byteLength < magic.byteLength) {
    return false;
  }
  for (let index = 0; index < magic.byteLength; index += 1) {
    if (bytes[index] !== magic[index]) {
      return false;
    }
  }
  return true;
}

function looksLikeHtmlOrScript(bytes: Uint8Array): boolean {
  const head = Buffer.from(bytes.subarray(0, 64)).toString("utf8").trim().toLowerCase();
  return HTML_PREFIXES.some((prefix) => head.startsWith(prefix));
}

export function sniffDocumentMimeType(bytes: Uint8Array): AllowedDocumentMimeType {
  if (bytes.byteLength === 0) {
    throw new DocumentUploadValidationError("Empty files are not allowed");
  }
  if (startsWithBytes(bytes, EXE_MAGIC) || looksLikeHtmlOrScript(bytes)) {
    throw new DocumentUploadValidationError("Executable or script uploads are not allowed");
  }
  if (startsWithBytes(bytes, PDF_MAGIC)) {
    return "application/pdf";
  }
  if (startsWithBytes(bytes, JPEG_MAGIC)) {
    return "image/jpeg";
  }
  if (startsWithBytes(bytes, PNG_MAGIC)) {
    return "image/png";
  }
  throw new DocumentUploadValidationError("Unsupported file type");
}

export function storedExtensionForMime(
  mimeType: AllowedDocumentMimeType,
): StoredDocumentExtension {
  return MIME_STORED_EXTENSION[mimeType];
}

export function extensionMatchesMime(
  extension: string | null,
  mimeType: AllowedDocumentMimeType,
): boolean {
  if (extension === null) {
    return true;
  }
  return MIME_EXTENSIONS[mimeType].includes(extension);
}

export function assertDocumentSize(byteLength: number): void {
  if (!Number.isInteger(byteLength) || byteLength <= 0 || byteLength > MAX_DOCUMENT_BYTES) {
    throw new DocumentUploadValidationError("File exceeds the 10 MB size limit");
  }
}
