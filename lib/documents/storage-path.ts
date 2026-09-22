import path from "node:path";

import { DocumentPathError, isSafeStoredFilename } from "@/lib/documents/filename";

const FORBIDDEN_ROOT_DIRS = ["public", "app", ".next", "node_modules"] as const;

export class DocumentStorageConfigError extends Error {
  readonly code = "VALIDATION" as const;

  constructor() {
    super("Document storage directory is not allowed");
    this.name = "DocumentStorageConfigError";
  }
}

export function assertAllowedStorageRoot(root: string, cwd: string = process.cwd()): string {
  const resolvedRoot = path.resolve(root);
  for (const dir of FORBIDDEN_ROOT_DIRS) {
    const forbidden = path.resolve(cwd, dir);
    if (resolvedRoot === forbidden || resolvedRoot.startsWith(forbidden + path.sep)) {
      throw new DocumentStorageConfigError();
    }
  }
  return resolvedRoot;
}

export function resolveDocumentStoragePath(root: string, storedFilename: string): string {
  if (!isSafeStoredFilename(storedFilename)) {
    throw new DocumentPathError();
  }

  const resolvedRoot = path.resolve(root);
  const resolved = path.resolve(resolvedRoot, storedFilename);
  const prefix = resolvedRoot.endsWith(path.sep) ? resolvedRoot : resolvedRoot + path.sep;

  if (!resolved.startsWith(prefix) || path.basename(resolved) !== storedFilename) {
    throw new DocumentPathError();
  }

  return resolved;
}
