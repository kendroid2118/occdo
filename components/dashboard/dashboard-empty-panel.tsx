type DashboardEmptyPanelProps = {
  title: string;
  message: string;
};

export function DashboardEmptyPanel({ title, message }: DashboardEmptyPanelProps) {
  return (
    <article className="rounded-lg border border-dashed border-slate-300 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm text-slate-600">{message}</p>
    </article>
  );
}
