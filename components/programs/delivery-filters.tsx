import Link from "next/link";

import type { ProgramCatalogs } from "@/lib/actions/programs";
import type { ListServiceDeliveriesInput } from "@/lib/validation/service-delivery";
import { Button } from "@/components/ui/button";

type CooperativeOption = {
  id: string;
  name: string;
  cooperativeCode: string;
};

type DeliveryFiltersProps = {
  catalogs: ProgramCatalogs;
  cooperatives: CooperativeOption[];
  values: ListServiceDeliveriesInput;
};

function dateInputValue(value: Date | undefined): string {
  if (!value) {
    return "";
  }
  return value.toISOString().slice(0, 10);
}

export function DeliveryFilters({
  catalogs,
  cooperatives,
  values,
}: DeliveryFiltersProps) {
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
        <label className="block text-sm font-medium text-slate-800" htmlFor="serviceTypeId">
          Service type
        </label>
        <select
          className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700"
          defaultValue={values.serviceTypeId ?? ""}
          id="serviceTypeId"
          name="serviceTypeId"
        >
          <option value="">All</option>
          {catalogs.serviceTypes.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-800" htmlFor="deliveredFrom">
          From date
        </label>
        <input
          className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700"
          defaultValue={dateInputValue(values.deliveredFrom)}
          id="deliveredFrom"
          name="deliveredFrom"
          type="date"
        />
      </div>
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-800" htmlFor="deliveredTo">
          To date
        </label>
        <input
          className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700"
          defaultValue={dateInputValue(values.deliveredTo)}
          id="deliveredTo"
          name="deliveredTo"
          type="date"
        />
      </div>
      <div className="flex items-end gap-2 xl:col-span-4">
        <Button type="submit">Apply filters</Button>
        <Button asChild variant="outline">
          <Link href="/programs">Clear</Link>
        </Button>
      </div>
    </form>
  );
}
