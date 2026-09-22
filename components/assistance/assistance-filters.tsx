import Link from "next/link";

import type { AssistanceCatalogs } from "@/lib/actions/assistance";
import type { ListAssistanceRecordsInput } from "@/lib/validation/assistance";
import { Button } from "@/components/ui/button";

type CooperativeOption = {
  id: string;
  name: string;
  cooperativeCode: string;
};

type AssistanceFiltersProps = {
  catalogs: AssistanceCatalogs;
  cooperatives: CooperativeOption[];
  values: ListAssistanceRecordsInput;
};

export function AssistanceFilters({
  catalogs,
  cooperatives,
  values,
}: AssistanceFiltersProps) {
  return (
    <form className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-2 xl:grid-cols-4">
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-800" htmlFor="cooperativeId">
          Cooperative
        </label>
        <select
          className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700"
          defaultValue={values.cooperativeId ?? ""}
          id="cooperativeId"
          name="cooperativeId"
        >
          <option value="">All</option>
          {cooperatives.map((cooperative) => (
            <option key={cooperative.id} value={cooperative.id}>
              {cooperative.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-800" htmlFor="assistanceTypeId">
          Assistance type
        </label>
        <select
          className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700"
          defaultValue={values.assistanceTypeId ?? ""}
          id="assistanceTypeId"
          name="assistanceTypeId"
        >
          <option value="">All</option>
          {catalogs.types.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-800" htmlFor="statusId">
          Status
        </label>
        <select
          className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700"
          defaultValue={values.statusId ?? ""}
          id="statusId"
          name="statusId"
        >
          <option value="">All</option>
          {catalogs.statuses.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-end gap-2 xl:col-span-4">
        <Button type="submit">Apply filters</Button>
        <Button asChild variant="outline">
          <Link href="/financial-assistance">Clear</Link>
        </Button>
      </div>
    </form>
  );
}
