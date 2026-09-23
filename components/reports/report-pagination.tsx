import type { ReportFiltersInput } from "@/lib/validation/reports";

type ReportPaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  values: ReportFiltersInput;
  label: string;
};

function hrefForPage(values: ReportFiltersInput, page: number): string {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("pageSize", String(values.pageSize));
  if (values.dateFrom) params.set("dateFrom", values.dateFrom);
  if (values.dateTo) params.set("dateTo", values.dateTo);
  if (values.cooperativeId) params.set("cooperativeId", values.cooperativeId);
  if (values.typeId) params.set("typeId", values.typeId);
  if (values.sectorId) params.set("sectorId", values.sectorId);
  if (values.barangayId) params.set("barangayId", values.barangayId);
  if (values.statusId) params.set("statusId", values.statusId);
  if (values.accreditationStatusId) {
    params.set("accreditationStatusId", values.accreditationStatusId);
  }
  return `/reports?${params.toString()}`;
}

export function ReportPagination({
  page,
  pageSize,
  total,
  values,
  label,
}: ReportPaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  if (total === 0 || pageCount === 1) {
    return (
      <p className="text-sm text-slate-600">
        {total} {label}
      </p>
    );
  }

  return (
    <nav aria-label={`${label} pages`} className="flex items-center justify-between text-sm">
      <p className="text-slate-600">
        Page {page} of {pageCount} ({total} {label})
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
