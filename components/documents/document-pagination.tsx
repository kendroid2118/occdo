import Link from "next/link";

import type { ListDocumentsInput } from "@/lib/validation/document";

type DocumentPaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  values: ListDocumentsInput;
};

function hrefFor(page: number, values: ListDocumentsInput): string {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("pageSize", String(values.pageSize));
  if (values.cooperativeId) {
    params.set("cooperativeId", values.cooperativeId);
  }
  if (values.documentTypeId) {
    params.set("documentTypeId", values.documentTypeId);
  }
  return `/documents?${params.toString()}`;
}

export function DocumentPagination({
  page,
  pageSize,
  total,
  values,
}: DocumentPaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  if (total === 0 || pageCount === 1) {
    return null;
  }

  return (
    <nav aria-label="Document pages" className="flex items-center justify-between text-sm">
      <p className="text-slate-600">
        Page {page} of {pageCount} ({total} total)
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link
            className="rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-800 hover:bg-slate-50"
            href={hrefFor(page - 1, values)}
          >
            Previous
          </Link>
        ) : null}
        {page < pageCount ? (
          <Link
            className="rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-800 hover:bg-slate-50"
            href={hrefFor(page + 1, values)}
          >
            Next
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
