import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AccreditationFileForm } from "@/components/cooperatives/accreditation-file-form";
import { getCooperativeAction, listCooperativesAction } from "@/lib/actions/cooperatives";
import { listCooperativeCatalogsAction } from "@/lib/actions/reference";
import { getCurrentSessionUser } from "@/lib/auth/current-session";
import { canWriteCooperatives } from "@/lib/cooperatives/access";

export const metadata: Metadata = {
  title: "File accreditation case",
};

type NewCasePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function NewAccreditationCasePage({
  searchParams,
}: NewCasePageProps) {
  const sessionUser = await getCurrentSessionUser();
  if (!sessionUser || !canWriteCooperatives(sessionUser.role)) {
    notFound();
  }

  const params = await searchParams;
  const defaultCooperativeId = firstParam(params.cooperativeId);

  const [catalogsResult, cooperativesResult, selectedResult] = await Promise.all([
    listCooperativeCatalogsAction({}),
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
        <h2 className="text-xl font-semibold text-slate-900">File accreditation case</h2>
        <p className="mt-1 text-sm text-slate-600">
          Case type and status are selected from active catalog records.
        </p>
      </div>
      {catalogsResult.ok && cooperativesResult.ok ? (
        <AccreditationFileForm
          catalogs={catalogsResult.data}
          cooperatives={cooperatives}
          defaultCooperativeId={
            selectedResult?.ok ? selectedResult.data.id : defaultCooperativeId
          }
        />
      ) : (
        <p className="text-sm text-red-700" role="alert">
          Could not load filing options.
        </p>
      )}
    </div>
  );
}
