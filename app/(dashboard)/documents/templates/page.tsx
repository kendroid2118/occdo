import type { Metadata } from "next";

import { listDocumentTemplatesAction } from "@/lib/actions/documents";
import { DOCUMENT_ACTION_ERROR_MESSAGE } from "@/lib/documents/errors";

export const metadata: Metadata = {
  title: "Document templates",
};

export default async function DocumentTemplatesPage() {
  const result = await listDocumentTemplatesAction({});

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Templates / Forms</h2>
        <p className="mt-1 text-sm text-slate-600">
          Office template names are listed from the database. Files are not published at public
          URLs from this screen.
        </p>
      </div>

      {!result.ok ? (
        <p className="text-sm text-red-700" role="alert">
          {DOCUMENT_ACTION_ERROR_MESSAGE[result.code]}
        </p>
      ) : result.data.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-600">
          No document templates are available yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Description</th>
              </tr>
            </thead>
            <tbody>
              {result.data.map((row) => (
                <tr className="border-b border-slate-100 last:border-0" key={row.id}>
                  <td className="px-4 py-3 font-medium text-slate-800">{row.name}</td>
                  <td className="px-4 py-3 text-slate-700">{row.description ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
