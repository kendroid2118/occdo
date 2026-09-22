import Link from "next/link";

import type { ListComplianceRecordsInput } from "@/lib/validation/compliance-record";

type ComplianceRecordPaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  values: ListComplianceRecordsInput;
};

function hrefForPage(values: ListComplianceRecordsInput, page: number): string {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("pageSize", String(values.pageSize));
  if (values.cooperativeId) params.set("cooperativeId", values.cooperativeId);
  if (values.requirementId) params.set("requirementId", values.requirementId);
  if (values.statusId) params.set("statusId", values.statusId);
  return `/monitoring?${params.toString()}`;
}

export function ComplianceRecordPagination({
  page,
  pageSize,
  total,
  values,
}: ComplianceRecordPaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  if (total === 0 || pageCount === 1) {
    return null;
  }

  return (
    <nav
      aria-label="Compliance record pages"
      className="flex items-center justify-between text-sm"
    >
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
