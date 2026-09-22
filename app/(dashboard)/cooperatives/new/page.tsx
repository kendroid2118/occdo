import type { Metadata } from "next";

import { CooperativeForm } from "@/components/cooperatives/cooperative-form";
import { listCooperativeCatalogsAction } from "@/lib/actions/reference";

export const metadata: Metadata = {
  title: "New cooperative",
};

export default async function NewCooperativePage() {
  const catalogsResult = await listCooperativeCatalogsAction({});

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">New cooperative</h2>
        <p className="mt-1 text-sm text-slate-600">
          Type, sector, status, and barangay are selected from active catalog records.
        </p>
      </div>
      {catalogsResult.ok ? (
        <CooperativeForm catalogs={catalogsResult.data} />
      ) : (
        <p className="text-sm text-red-700" role="alert">
          Could not load reference catalogs.
        </p>
      )}
    </div>
  );
}
