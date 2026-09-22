import type { CooperativeCatalogs } from "@/lib/actions/reference";
import type { ListCooperativesInput } from "@/lib/validation/cooperative";
import { Button } from "@/components/ui/button";

type CooperativeFiltersProps = {
  catalogs: CooperativeCatalogs;
  values: ListCooperativesInput;
};

function FilterSelect({
  id,
  label,
  name,
  options,
  value,
}: {
  id: string;
  label: string;
  name: string;
  options: { id: string; name: string }[];
  value?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-800" htmlFor={id}>
        {label}
      </label>
      <select
        className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700"
        defaultValue={value ?? ""}
        id={id}
        name={name}
      >
        <option value="">All</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export function CooperativeFilters({ catalogs, values }: CooperativeFiltersProps) {
  return (
    <form className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-2 xl:grid-cols-3">
      <div className="space-y-1.5 md:col-span-2 xl:col-span-3">
        <label className="block text-sm font-medium text-slate-800" htmlFor="search">
          Search
        </label>
        <input
          className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700"
          defaultValue={values.search ?? ""}
          id="search"
          name="search"
          placeholder="Name or cooperative code"
          type="search"
        />
      </div>
      <FilterSelect
        id="typeId"
        label="Type"
        name="typeId"
        options={catalogs.types}
        value={values.typeId}
      />
      <FilterSelect
        id="sectorId"
        label="Sector"
        name="sectorId"
        options={catalogs.sectors}
        value={values.sectorId}
      />
      <FilterSelect
        id="barangayId"
        label="Barangay"
        name="barangayId"
        options={catalogs.barangays}
        value={values.barangayId}
      />
      <FilterSelect
        id="statusId"
        label="Status"
        name="statusId"
        options={catalogs.statuses}
        value={values.statusId}
      />
      <FilterSelect
        id="accreditationStatusId"
        label="Accreditation status"
        name="accreditationStatusId"
        options={catalogs.accreditationStatuses}
        value={values.accreditationStatusId}
      />
      <div className="flex items-end gap-2">
        <Button type="submit">Apply filters</Button>
        <Button asChild variant="outline">
          <a href="/cooperatives">Clear</a>
        </Button>
      </div>
    </form>
  );
}
