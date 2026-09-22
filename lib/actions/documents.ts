"use server";

import { redirect } from "next/navigation";

import { roleActionClient, type ActionErrorCode } from "@/lib/auth/action-client";
import { AUTH_ROLES } from "@/lib/auth/roles";
import { COOPERATIVE_WRITE_ROLES } from "@/lib/cooperatives/access";
import { CooperativeNotFoundError } from "@/lib/dal/cooperatives";
import {
  DocumentTypeConflictError,
  DocumentTypeInactiveError,
  DocumentTypeNotFoundError,
  createDocumentType,
  listActiveDocumentTypes,
} from "@/lib/dal/document-types";
import {
  CooperativeDocumentNotFoundError,
  DocumentScopeError,
  DocumentVerifyError,
  createCooperativeDocument,
  getCooperativeDocumentById,
  listCooperativeDocuments,
  verifyCooperativeDocument,
  type CooperativeDocumentListResult,
  type CooperativeDocumentRecord,
} from "@/lib/dal/documents";
import { listActiveDocumentTemplates } from "@/lib/dal/document-templates";
import type { ReferenceRecord } from "@/lib/dal/reference";
import { DocumentPathError, generateStoredFilename } from "@/lib/documents/filename";
import { inspectDocumentUpload } from "@/lib/documents/inspect";
import { DocumentUploadValidationError, MAX_DOCUMENT_BYTES } from "@/lib/documents/mime";
import {
  unlinkDocumentFile,
  writeDocumentFile,
} from "@/lib/storage/documents";
import {
  getDocumentSchema,
  listDocumentCatalogsSchema,
  listDocumentTemplatesSchema,
  listDocumentsSchema,
  uploadDocumentSchema,
  verifyDocumentSchema,
} from "@/lib/validation/document";
import { createCatalogItemSchema } from "@/lib/validation/program";

export type { CooperativeDocumentListResult, CooperativeDocumentRecord };

export type DocumentCatalogs = {
  documentTypes: ReferenceRecord[];
};

export type DocumentActionErrorCode = ActionErrorCode | "CONFLICT" | "NOT_FOUND";

export type DocumentActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: DocumentActionErrorCode };

async function mapDocumentAction<T>(
  run: () => Promise<{ ok: true; data: T } | { ok: false; code: ActionErrorCode }>,
): Promise<DocumentActionResult<T>> {
  try {
    return await run();
  } catch (error: unknown) {
    if (error instanceof DocumentScopeError) {
      return { ok: false, code: "FORBIDDEN" };
    }
    if (
      error instanceof CooperativeDocumentNotFoundError ||
      error instanceof DocumentTypeNotFoundError ||
      error instanceof CooperativeNotFoundError
    ) {
      return { ok: false, code: "NOT_FOUND" };
    }
    if (
      error instanceof DocumentUploadValidationError ||
      error instanceof DocumentPathError ||
      error instanceof DocumentTypeInactiveError ||
      error instanceof DocumentVerifyError
    ) {
      return { ok: false, code: "VALIDATION" };
    }
    if (error instanceof DocumentTypeConflictError) {
      return { ok: false, code: "CONFLICT" };
    }
    throw error;
  }
}

const createDocumentTypeInner = roleActionClient({
  schema: createCatalogItemSchema,
  roles: COOPERATIVE_WRITE_ROLES,
  handler: async ({ user, input }) => createDocumentType({ input, actorId: user.id }),
});

const uploadDocumentInner = roleActionClient({
  schema: uploadDocumentSchema,
  roles: COOPERATIVE_WRITE_ROLES,
  handler: async ({ user, input }) => {
    const inspected = inspectDocumentUpload({
      bytes: input.fileBytes,
      originalFilename: input.fileName,
    });
    const storedFilename = generateStoredFilename(inspected.extension);
    await writeDocumentFile(storedFilename, inspected.bytes);
    try {
      return await createCooperativeDocument({
        actorId: user.id,
        input: {
          cooperativeId: input.cooperativeId,
          documentTypeId: input.documentTypeId,
          reportingPeriod: input.reportingPeriod,
          originalFilename: inspected.originalFilename,
          storedFilename,
          mimeType: inspected.mimeType,
          sizeBytes: inspected.sizeBytes,
        },
      });
    } catch (error: unknown) {
      await unlinkDocumentFile(storedFilename);
      throw error;
    }
  },
});

const verifyDocumentInner = roleActionClient({
  schema: verifyDocumentSchema,
  roles: COOPERATIVE_WRITE_ROLES,
  handler: async ({ user, input }) =>
    verifyCooperativeDocument({ input, actorId: user.id }),
});

const listDocumentsInner = roleActionClient({
  schema: listDocumentsSchema,
  roles: AUTH_ROLES,
  handler: async ({ input }) => listCooperativeDocuments(input),
});

const getDocumentInner = roleActionClient({
  schema: getDocumentSchema,
  roles: AUTH_ROLES,
  handler: async ({ input }) => {
    const record = await getCooperativeDocumentById(input.id);
    if (!record) {
      throw new CooperativeDocumentNotFoundError();
    }
    return record;
  },
});

export const listDocumentCatalogsAction = roleActionClient({
  schema: listDocumentCatalogsSchema,
  roles: AUTH_ROLES,
  handler: async (): Promise<DocumentCatalogs> => {
    const documentTypes = await listActiveDocumentTypes();
    return { documentTypes };
  },
});

export const listDocumentTemplatesAction = roleActionClient({
  schema: listDocumentTemplatesSchema,
  roles: AUTH_ROLES,
  handler: async (): Promise<ReferenceRecord[]> => listActiveDocumentTemplates(),
});

export async function createDocumentTypeAction(
  input: unknown,
): Promise<DocumentActionResult<ReferenceRecord>> {
  return mapDocumentAction(() => createDocumentTypeInner(input));
}

export async function uploadDocumentAction(
  input: unknown,
): Promise<DocumentActionResult<CooperativeDocumentRecord>> {
  return mapDocumentAction(() => uploadDocumentInner(input));
}

export async function listDocumentsAction(
  input: unknown,
): Promise<DocumentActionResult<CooperativeDocumentListResult>> {
  return mapDocumentAction(() => listDocumentsInner(input));
}

export async function getDocumentAction(
  input: unknown,
): Promise<DocumentActionResult<CooperativeDocumentRecord>> {
  return mapDocumentAction(() => getDocumentInner(input));
}

export async function verifyDocumentAction(
  input: unknown,
): Promise<DocumentActionResult<CooperativeDocumentRecord>> {
  return mapDocumentAction(() => verifyDocumentInner(input));
}

export async function uploadDocumentFormAction(
  _previous: DocumentActionResult<CooperativeDocumentRecord> | null,
  formData: FormData,
): Promise<DocumentActionResult<CooperativeDocumentRecord>> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size <= 0) {
    return { ok: false, code: "VALIDATION" };
  }
  if (file.size > MAX_DOCUMENT_BYTES) {
    return { ok: false, code: "VALIDATION" };
  }

  const result = await uploadDocumentAction({
    cooperativeId: formData.get("cooperativeId"),
    documentTypeId: formData.get("documentTypeId"),
    reportingPeriod: formData.get("reportingPeriod"),
    fileName: file.name,
    fileBytes: new Uint8Array(await file.arrayBuffer()),
  });
  if (result.ok) {
    redirect("/documents");
  }
  return result;
}

export async function verifyDocumentFormAction(formData: FormData): Promise<void> {
  const id = formData.get("id");
  const result = await verifyDocumentAction({
    id,
    cooperativeId: formData.get("cooperativeId"),
  });
  if (result.ok && typeof id === "string") {
    redirect(`/documents/${id}`);
  }
}
