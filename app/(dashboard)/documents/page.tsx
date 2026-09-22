import type { Metadata } from "next";
import Link from "next/link";

import { DocumentFilters } from "@/components/documents/document-filters";
import { DocumentPagination } from "@/components/documents/document-pagination";
import { DocumentTable } from "@/components/documents/document-table";
import { listCooperativesAction } from "@/lib/actions/cooperatives";
import { listDocumentCatalogsAction, listDocumentsAction } from "@/lib/actions/documents";
import { getCurrentSessionUser } from "@/lib/auth/current-session";
import { canWriteCooperatives } from "@/lib/cooperatives/access";
import { DOCUMENT_ACTION_ERROR_MESSAGE } from "@/lib/documents/errors";
import { listDocumentsSchema } from "@/lib/validation/document";

export const metadata: Metadata = {
  title: "Documents",
};

type DocumentsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function DocumentsPage({ searchParams }: DocumentsPageProps) {
  const params = await searchParams;
  const parsedQuery = listDocumentsSchema.safeParse({
    page: firstParam(params.page),
    pageSize: firstParam(params.pageSize),
    cooperativeId: firstParam(params.cooperativeId),
    documentTypeId: firstParam(params.documentTypeId),
  });

  const sessionUser = await getCurrentSessionUser();
  const canWrite = sessionUser ? canWriteCooperatives(sessionUser.role) : false;
  const [catalogsResult, cooperativesResult] = await Promise.all([
    listDocumentCatalogsAction({}),
    listCooperativesAction({ page: 1, pageSize: 50 }),
  ]);
  const listResult = parsedQuery.success
    ? await listDocumentsAction(parsedQuery.data)
    : { ok: false as const, code: "VALIDATION" as const };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Cooperative documents</h2>
          <p className="mt-1 text-sm text-slate-600">
            Uploads are stored with server-generated names. Downloads require a signed-in session.
          </p>
        </div>
        {canWrite ? (
          <Link
            className="inline-flex h-9 items-center rounded-md bg-occdo-700 px-3 text-sm font-medium text-white hover:bg-occdo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700"
            href="/documents/new"
          >
            Upload document
          </Link>
        ) : null}
      </div>

      {!parsedQuery.success ||
      !listResult.ok ||
      !catalogsResult.ok ||
      !cooperativesResult.ok ? (
        <p className="text-sm text-red-700" role="alert">
          {catalogsResult.ok && cooperativesResult.ok
            ? DOCUMENT_ACTION_ERROR_MESSAGE[
                parsedQuery.success && !listResult.ok ? listResult.code : "VALIDATION"
              ]
            : "Could not load catalogs or cooperatives."}
        </p>
      ) : (
        <>
          <DocumentFilters
            catalogs={catalogsResult.data}
            cooperatives={cooperativesResult.data.items}
            values={parsedQuery.data}
          />
          <DocumentTable items={listResult.data.items} />
          <DocumentPagination
            page={listResult.data.page}
            pageSize={listResult.data.pageSize}
            total={listResult.data.total}
            values={parsedQuery.data}
          />
        </>
      )}
    </div>
  );
}
