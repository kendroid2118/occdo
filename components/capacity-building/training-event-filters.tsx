import Link from "next/link";

import { TRAINING_KIND_LABEL } from "@/lib/capacity-building/training-errors";
import { TRAINING_KINDS, type ListTrainingEventsInput } from "@/lib/validation/training-event";
import { Button } from "@/components/ui/button";

type TrainingEventFiltersProps = {
  values: ListTrainingEventsInput;
};

export function TrainingEventFilters({ values }: TrainingEventFiltersProps) {
  return (
    <form className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-2">
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-800" htmlFor="kind">
          Kind
        </label>
        <select
          className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700"
          defaultValue={values.kind ?? ""}
          id="kind"
          name="kind"
        >
          <option value="">All</option>
          {TRAINING_KINDS.map((kind) => (
            <option key={kind} value={kind}>
              {TRAINING_KIND_LABEL[kind]}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-end gap-2">
        <Button type="submit">Apply filters</Button>
        <Button asChild variant="outline">
          <Link href="/capacity-building">Clear</Link>
        </Button>
      </div>
    </form>
  );
}
