type DashboardCdaCardProps = {
  url: string | null;
};

export function DashboardCdaCard({ url }: DashboardCdaCardProps) {
  if (!url) {
    return null;
  }

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900">CDA Portal</h2>
      <p className="mt-1 text-sm text-slate-600">
        External Cooperative Development Authority website. OCCDO does not load CDA data.
      </p>
      <a
        className="mt-4 inline-flex h-9 items-center rounded-md bg-occdo-700 px-3 text-sm font-medium text-white hover:bg-occdo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700"
        href={url}
        rel="noopener noreferrer"
        target="_blank"
      >
        Open CDA Portal
      </a>
    </article>
  );
}
