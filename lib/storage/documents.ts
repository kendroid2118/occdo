import "server-only";

import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import { env } from "@/lib/env";
import {
  assertAllowedStorageRoot,
  resolveDocumentStoragePath,
} from "@/lib/documents/storage-path";

export function getDocumentStorageRoot(): string {
  const configured = env.DOCUMENT_STORAGE_DIR ?? path.join(process.cwd(), "storage", "documents");
  return assertAllowedStorageRoot(configured);
}

export async function writeDocumentFile(
  storedFilename: string,
  bytes: Uint8Array,
  root: string = getDocumentStorageRoot(),
): Promise<void> {
  const storageRoot = assertAllowedStorageRoot(root);
  const destination = resolveDocumentStoragePath(storageRoot, storedFilename);
  await mkdir(storageRoot, { recursive: true });
  await writeFile(destination, bytes, { flag: "wx" });
}

export async function readDocumentFile(
  storedFilename: string,
  root: string = getDocumentStorageRoot(),
): Promise<Uint8Array> {
  const destination = resolveDocumentStoragePath(assertAllowedStorageRoot(root), storedFilename);
  return readFile(destination);
}

export async function unlinkDocumentFile(
  storedFilename: string,
  root: string = getDocumentStorageRoot(),
): Promise<void> {
  const destination = resolveDocumentStoragePath(assertAllowedStorageRoot(root), storedFilename);
  try {
    await unlink(destination);
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return;
    }
    throw error;
  }
}
