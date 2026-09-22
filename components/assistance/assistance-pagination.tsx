import Link from "next/link";

import type { ListAssistanceRecordsInput } from "@/lib/validation/assistance";

type AssistancePaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  values: ListAssistanceRecordsInput;
};

function hrefForPage(values: ListAssistanceRecordsInput, page: number): string {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("pageSize", String(values.pageSize));
  if (values.cooperativeId) params.set("cooperativeId", values.cooperativeId);
  if (values.assistanceTypeId) params.set("assistanceTypeId", values.assistanceTypeId);
  if (values.statusId) params.set("statusId", values.statusId);
  return `/financial-assistance?${params.toString()}`;
}

export function AssistancePagination({
  page,
  pageSize,
  total,
  values,
}: AssistancePaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  if (total === 0 || pageCount === 1) {
    return null;
  }

  return (
    <nav aria-label="Assistance record pages" className="flex items-center justify-between text-sm">
      <p className="text-slate-600">
        Page {page} of {pageCount} ({total} total)
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link
            className="rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-800 hover:bg-slate-50"
            href={hrefForPage(values, page - 1)}
          >
            Previous
          </Link>
        ) : null}
        {page < pageCount ? (
          <Link
            className="rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-800 hover:bg-slate-50"
            href={hrefForPage(values, page + 1)}
          >
            Next
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
