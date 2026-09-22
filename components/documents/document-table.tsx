import type { CooperativeDocumentRecord } from "@/lib/actions/documents";

type DocumentTableProps = {
  items: CooperativeDocumentRecord[];
};

function formatDate(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return date.toISOString().slice(0, 10);
}

export function DocumentTable({ items }: DocumentTableProps) {
  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-600">
        No documents match these filters.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-3 font-medium">Uploaded</th>
            <th className="px-4 py-3 font-medium">Cooperative</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Filename</th>
            <th className="px-4 py-3 font-medium">Period</th>
            <th className="px-4 py-3 font-medium">Download</th>
          </tr>
        </thead>
        <tbody>
          {items.map((row) => (
            <tr className="border-b border-slate-100 last:border-0" key={row.id}>
              <td className="px-4 py-3 text-slate-700">{formatDate(row.uploadedAt)}</td>
              <td className="px-4 py-3 text-slate-800">
                <p className="font-medium">{row.cooperative.name}</p>
                <p className="text-xs text-slate-500">{row.cooperative.cooperativeCode}</p>
              </td>
              <td className="px-4 py-3 text-slate-700">{row.documentType.name}</td>
              <td className="px-4 py-3 text-slate-700">{row.originalFilename}</td>
              <td className="px-4 py-3 text-slate-700">{row.reportingPeriod ?? "—"}</td>
              <td className="px-4 py-3">
                <a
                  className="font-medium text-occdo-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700"
                  href={`/api/documents/${row.id}`}
                >
                  Download
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
