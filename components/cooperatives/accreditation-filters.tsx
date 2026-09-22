import type { CooperativeCatalogs } from "@/lib/actions/reference";
import type { ListAccreditationCasesInput } from "@/lib/validation/accreditation";
import { Button } from "@/components/ui/button";

type AccreditationFiltersProps = {
  catalogs: CooperativeCatalogs;
  values: ListAccreditationCasesInput;
};

export function AccreditationFilters({ catalogs, values }: AccreditationFiltersProps) {
  return (
    <form className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-2">
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-800" htmlFor="statusId">
          Case status
        </label>
        <select
          className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700"
          defaultValue={values.statusId ?? ""}
          id="statusId"
          name="statusId"
        >
          <option value="">All</option>
          {catalogs.caseStatuses.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-end gap-2">
        <Button type="submit">Apply filters</Button>
        <Button asChild variant="outline">
          <a href="/cooperatives/cases">Clear</a>
        </Button>
      </div>
    </form>
  );
}
