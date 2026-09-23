import type { DashboardCatalogCount } from "@/lib/actions/dashboard";
import { barShare, maxCatalogCount } from "@/lib/dashboard/bar-scale";

type DashboardBarListProps = {
  title: string;
  description?: string;
  items: DashboardCatalogCount[];
  emptyLabel: string;
  unitLabel: string;
};

export function DashboardBarList({
  title,
  description,
  items,
  emptyLabel,
  unitLabel,
}: DashboardBarListProps) {
  const max = maxCatalogCount(items);
  const hasCounts = max > 0;

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">{emptyLabel}</p>
      ) : (
        <table className="mt-4 w-full text-sm">
          <caption className="sr-only">
            {title}: {unitLabel} by catalog name
          </caption>
          <thead>
            <tr className="text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <th className="pb-2 pr-3 font-medium" scope="col">
                Name
              </th>
              <th className="pb-2 pr-3 text-right font-medium" scope="col">
                Count
              </th>
              <th className="w-1/2 pb-2 font-medium" scope="col">
                Distribution
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const share = barShare(item.count, max);
              return (
                <tr className="border-t border-slate-100" key={item.id}>
                  <th className="py-2 pr-3 text-left font-medium text-slate-800" scope="row">
                    {item.name}
                  </th>
                  <td className="py-2 pr-3 text-right tabular-nums text-slate-700">
                    {item.count.toLocaleString("en-PH")}
                  </td>
                  <td className="py-2">
                    <div
                      aria-label={`${item.name}: ${item.count} ${unitLabel}`}
                      className="h-2.5 overflow-hidden rounded-full bg-slate-100"
                      role="img"
                    >
                      <div
                        className="h-full rounded-full bg-occdo-700"
                        style={{ width: `${hasCounts ? share : 0}%` }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </article>
  );
}
