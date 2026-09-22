import { randomUUID } from "node:crypto";

import type { StoredDocumentExtension } from "@/lib/documents/mime";

const STORED_FILENAME_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(pdf|jpg|png)$/;

const SAFE_ORIGINAL_CHARS = /[^A-Za-z0-9._ -]/g;

export class DocumentPathError extends Error {
  readonly code = "VALIDATION" as const;

  constructor(message = "Invalid document filename") {
    super(message);
    this.name = "DocumentPathError";
  }
}

export function generateStoredFilename(extension: StoredDocumentExtension): string {
  return `${randomUUID()}.${extension}`;
}

export function isSafeStoredFilename(value: string): boolean {
  return STORED_FILENAME_PATTERN.test(value);
}

export function originalFilenameExtension(originalFilename: string): string | null {
  const base = basenameOnly(originalFilename);
  const dot = base.lastIndexOf(".");
  if (dot <= 0 || dot === base.length - 1) {
    return null;
  }
  return base.slice(dot + 1).toLowerCase();
}

export function sanitizeOriginalFilename(originalFilename: string): string {
  const base = basenameOnly(originalFilename)
    .replace(SAFE_ORIGINAL_CHARS, "_")
    .replace(/_{2,}/g, "_")
    .trim();
  if (!base || base === "." || base === "..") {
    return "upload";
  }
  return base.slice(0, 255);
}

export function attachmentContentDisposition(originalFilename: string): string {
  const fallback = sanitizeOriginalFilename(originalFilename)
    .replace(/["\\\r\n;]/g, "_")
    .replace(/[^\x20-\x7E]/g, "_");
  const encoded = encodeURIComponent(sanitizeOriginalFilename(originalFilename)).replace(
    /'/g,
    "%27",
  );
  return `attachment; filename="${fallback}"; filename*=UTF-8''${encoded}`;
}

function basenameOnly(value: string): string {
  const normalized = value.replace(/\\/g, "/");
  const segments = normalized.split("/");
  return segments[segments.length - 1] ?? "";
}
