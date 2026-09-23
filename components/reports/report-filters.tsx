import Link from "next/link";

import type { CooperativeCatalogs } from "@/lib/actions/reference";
import type { ReportCooperativeOption } from "@/lib/actions/reports";
import { Button } from "@/components/ui/button";
import type { ReportFiltersInput } from "@/lib/validation/reports";

type ReportFiltersProps = {
  catalogs: CooperativeCatalogs;
  cooperatives: ReportCooperativeOption[];
  values: ReportFiltersInput;
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

export function ReportFilters({ catalogs, cooperatives, values }: ReportFiltersProps) {
  return (
    <form className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-2 xl:grid-cols-3">
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-800" htmlFor="dateFrom">
          Date from (Asia/Manila)
        </label>
        <input
          className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700"
          defaultValue={values.dateFrom ?? ""}
          id="dateFrom"
          name="dateFrom"
          type="date"
        />
      </div>
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-800" htmlFor="dateTo">
          Date to (Asia/Manila)
        </label>
        <input
          className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700"
          defaultValue={values.dateTo ?? ""}
          id="dateTo"
          name="dateTo"
          type="date"
        />
      </div>
      <FilterSelect
        id="cooperativeId"
        label="Cooperative"
        name="cooperativeId"
        options={cooperatives.map((row) => ({
          id: row.id,
          name: `${row.name} (${row.cooperativeCode})`,
        }))}
        value={values.cooperativeId}
      />
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
          <Link href="/reports">Clear</Link>
        </Button>
      </div>
    </form>
  );
}
