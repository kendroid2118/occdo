import {
  DocumentPathError,
  originalFilenameExtension,
  sanitizeOriginalFilename,
} from "@/lib/documents/filename";
import {
  assertDocumentSize,
  extensionMatchesMime,
  sniffDocumentMimeType,
  storedExtensionForMime,
  type AllowedDocumentMimeType,
  type StoredDocumentExtension,
} from "@/lib/documents/mime";

export type InspectedDocumentUpload = {
  bytes: Uint8Array;
  mimeType: AllowedDocumentMimeType;
  extension: StoredDocumentExtension;
  originalFilename: string;
  sizeBytes: number;
};

export function inspectDocumentUpload(options: {
  bytes: Uint8Array;
  originalFilename: string;
}): InspectedDocumentUpload {
  assertDocumentSize(options.bytes.byteLength);
  const mimeType = sniffDocumentMimeType(options.bytes);
  const clientExtension = originalFilenameExtension(options.originalFilename);
  if (!extensionMatchesMime(clientExtension, mimeType)) {
    throw new DocumentPathError("File extension does not match the detected type");
  }

  return {
    bytes: options.bytes,
    mimeType,
    extension: storedExtensionForMime(mimeType),
    originalFilename: sanitizeOriginalFilename(options.originalFilename),
    sizeBytes: options.bytes.byteLength,
  };
}
