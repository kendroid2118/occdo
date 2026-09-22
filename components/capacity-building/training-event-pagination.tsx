import type { ListTrainingEventsInput } from "@/lib/validation/training-event";

type TrainingEventPaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  values: ListTrainingEventsInput;
};

function hrefForPage(values: ListTrainingEventsInput, page: number): string {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("pageSize", String(values.pageSize));
  if (values.kind) {
    params.set("kind", values.kind);
  }
  return `/capacity-building?${params.toString()}`;
}

export function TrainingEventPagination({
  page,
  pageSize,
  total,
  values,
}: TrainingEventPaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  if (total === 0 || pageCount === 1) {
    return null;
  }

  return (
    <nav aria-label="Training event pages" className="flex items-center justify-between text-sm">
      <p className="text-slate-600">
        Page {page} of {pageCount} ({total} total)
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <a
            className="rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-800 hover:bg-slate-50"
            href={hrefForPage(values, page - 1)}
          >
            Previous
          </a>
        ) : null}
        {page < pageCount ? (
          <a
            className="rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-800 hover:bg-slate-50"
            href={hrefForPage(values, page + 1)}
          >
            Next
          </a>
        ) : null}
      </div>
    </nav>
  );
}
