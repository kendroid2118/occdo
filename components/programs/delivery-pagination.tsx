import type { ListServiceDeliveriesInput } from "@/lib/validation/service-delivery";

type DeliveryPaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  values: ListServiceDeliveriesInput;
};

function dateParam(value: Date | undefined): string | undefined {
  if (!value) {
    return undefined;
  }
  return value.toISOString().slice(0, 10);
}

function hrefForPage(values: ListServiceDeliveriesInput, page: number): string {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("pageSize", String(values.pageSize));
  if (values.cooperativeId) params.set("cooperativeId", values.cooperativeId);
  if (values.serviceTypeId) params.set("serviceTypeId", values.serviceTypeId);
  const from = dateParam(values.deliveredFrom);
  const to = dateParam(values.deliveredTo);
  if (from) params.set("deliveredFrom", from);
  if (to) params.set("deliveredTo", to);
  return `/programs?${params.toString()}`;
}

export function DeliveryPagination({
  page,
  pageSize,
  total,
  values,
}: DeliveryPaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  if (total === 0 || pageCount === 1) {
    return null;
  }

  return (
    <nav aria-label="Service delivery pages" className="flex items-center justify-between text-sm">
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
