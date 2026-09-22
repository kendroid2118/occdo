"use client";

import Link from "next/link";
import { useActionState } from "react";

import { uploadDocumentFormAction, type DocumentCatalogs } from "@/lib/actions/documents";
import { DOCUMENT_ACTION_ERROR_MESSAGE } from "@/lib/documents/errors";
import { MAX_DOCUMENT_BYTES } from "@/lib/documents/mime";
import { Button } from "@/components/ui/button";

const fieldClass =
  "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700";

export type DocumentCooperativeOption = {
  id: string;
  name: string;
  cooperativeCode: string;
};

type DocumentUploadFormProps = {
  catalogs: DocumentCatalogs;
  cooperatives: DocumentCooperativeOption[];
  defaultCooperativeId?: string;
};

export function DocumentUploadForm({
  catalogs,
  cooperatives,
  defaultCooperativeId,
}: DocumentUploadFormProps) {
  const [state, formAction, pending] = useActionState(uploadDocumentFormAction, null);
  const catalogsReady = catalogs.documentTypes.length > 0 && cooperatives.length > 0;
  const errorMessage =
    state && state.ok === false ? DOCUMENT_ACTION_ERROR_MESSAGE[state.code] : null;
  const maxMegabytes = MAX_DOCUMENT_BYTES / (1024 * 1024);

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      {!catalogsReady ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Active document types and at least one cooperative are required.
        </p>
      ) : null}

      {errorMessage ? (
        <p className="text-sm text-red-700" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5 md:col-span-2">
          <label className="block text-sm font-medium text-slate-800" htmlFor="cooperativeId">
            Cooperative
          </label>
          <select
            className={fieldClass}
            defaultValue={defaultCooperativeId ?? ""}
            id="cooperativeId"
            name="cooperativeId"
            required
          >
            <option value="">Select a cooperative</option>
            {cooperatives.map((cooperative) => (
              <option key={cooperative.id} value={cooperative.id}>
                {cooperative.name} ({cooperative.cooperativeCode})
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-800" htmlFor="documentTypeId">
            Document type
          </label>
          <select
            className={fieldClass}
            defaultValue=""
            id="documentTypeId"
            name="documentTypeId"
            required
          >
            <option value="">Select a document type</option>
            {catalogs.documentTypes.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-800" htmlFor="reportingPeriod">
            Reporting period
          </label>
          <input
            className={fieldClass}
            id="reportingPeriod"
            name="reportingPeriod"
            placeholder="2026 or 2026-Q1"
            type="text"
          />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <label className="block text-sm font-medium text-slate-800" htmlFor="file">
            File
          </label>
          <input
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            className="block w-full text-sm text-slate-900 file:mr-3 file:rounded-md file:border-0 file:bg-occdo-700 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
            id="file"
            name="file"
            required
            type="file"
          />
          <p className="text-xs text-slate-500">
            PDF, JPEG, or PNG only. Maximum {maxMegabytes} MB. The original filename is stored as
            display metadata and is not used as the storage path.
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button disabled={pending || !catalogsReady} type="submit">
          {pending ? "Uploading…" : "Upload document"}
        </Button>
        <Button asChild variant="outline">
          <Link href="/documents">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
