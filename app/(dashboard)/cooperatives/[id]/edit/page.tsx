import type { Metadata } from "next";

import { CooperativeForm } from "@/components/cooperatives/cooperative-form";
import { getCooperativeAction } from "@/lib/actions/cooperatives";
import { listCooperativeCatalogsAction } from "@/lib/actions/reference";
import { COOPERATIVE_ACTION_ERROR_MESSAGE } from "@/lib/cooperatives/form-errors";

export const metadata: Metadata = {
  title: "Edit cooperative",
};

type EditCooperativePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditCooperativePage({ params }: EditCooperativePageProps) {
  const { id } = await params;
  const [cooperativeResult, catalogsResult] = await Promise.all([
    getCooperativeAction({ id }),
    listCooperativeCatalogsAction({}),
  ]);

  if (!cooperativeResult.ok) {
    return (
      <p className="text-sm text-red-700" role="alert">
        {COOPERATIVE_ACTION_ERROR_MESSAGE[cooperativeResult.code]}
      </p>
    );
  }

  if (!catalogsResult.ok) {
    return (
      <p className="text-sm text-red-700" role="alert">
        Could not load reference catalogs.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Edit cooperative</h2>
        <p className="mt-1 text-sm text-slate-600">{cooperativeResult.data.name}</p>
      </div>
      <CooperativeForm
        catalogs={catalogsResult.data}
        cooperative={cooperativeResult.data}
      />
    </div>
  );
}
