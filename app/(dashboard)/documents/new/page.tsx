import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DocumentUploadForm } from "@/components/documents/document-upload-form";
import { getCooperativeAction, listCooperativesAction } from "@/lib/actions/cooperatives";
import { listDocumentCatalogsAction } from "@/lib/actions/documents";
import { getCurrentSessionUser } from "@/lib/auth/current-session";
import { canWriteCooperatives } from "@/lib/cooperatives/access";

export const metadata: Metadata = {
  title: "Upload document",
};

type NewDocumentPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function NewDocumentPage({ searchParams }: NewDocumentPageProps) {
  const sessionUser = await getCurrentSessionUser();
  if (!sessionUser || !canWriteCooperatives(sessionUser.role)) {
    notFound();
  }

  const params = await searchParams;
  const defaultCooperativeId = firstParam(params.cooperativeId);

  const [catalogsResult, cooperativesResult, selectedResult] = await Promise.all([
    listDocumentCatalogsAction({}),
    listCooperativesAction({ page: 1, pageSize: 50 }),
    defaultCooperativeId
      ? getCooperativeAction({ id: defaultCooperativeId })
      : Promise.resolve(null),
  ]);

  const cooperatives = cooperativesResult.ok ? cooperativesResult.data.items : [];
  if (selectedResult?.ok) {
    const alreadyListed = cooperatives.some((row) => row.id === selectedResult.data.id);
    if (!alreadyListed) {
      cooperatives.unshift(selectedResult.data);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Upload document</h2>
        <p className="mt-1 text-sm text-slate-600">
          The original filename is kept as metadata only. Storage names are generated on the
          server.
        </p>
      </div>
      {catalogsResult.ok && cooperativesResult.ok ? (
        <DocumentUploadForm
          catalogs={catalogsResult.data}
          cooperatives={cooperatives}
          defaultCooperativeId={
            selectedResult?.ok ? selectedResult.data.id : defaultCooperativeId
          }
        />
      ) : (
        <p className="text-sm text-red-700" role="alert">
          Could not load upload options.
        </p>
      )}
    </div>
  );
}
