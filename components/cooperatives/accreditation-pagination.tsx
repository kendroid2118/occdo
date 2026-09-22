import type { ListAccreditationCasesInput } from "@/lib/validation/accreditation";

type AccreditationPaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  values: ListAccreditationCasesInput;
};

function hrefForPage(values: ListAccreditationCasesInput, page: number): string {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("pageSize", String(values.pageSize));
  if (values.statusId) {
    params.set("statusId", values.statusId);
  }
  return `/cooperatives/cases?${params.toString()}`;
}

export function AccreditationPagination({
  page,
  pageSize,
  total,
  values,
}: AccreditationPaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  if (total === 0 || pageCount === 1) {
    return null;
  }

  return (
    <nav aria-label="Accreditation case pages" className="flex items-center justify-between text-sm">
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
