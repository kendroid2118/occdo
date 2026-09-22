type ModulePlaceholderProps = {
  title: string;
  milestone: string;
};

export function ModulePlaceholder({ title, milestone }: ModulePlaceholderProps) {
  return (
    <section className="max-w-3xl">
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        This module is a navigation placeholder. Implementation is scheduled for{" "}
        <span className="font-medium text-slate-800">{milestone}</span>. No records
        are loaded yet, and dashboard figures will come from the database in M10.
      </p>
    </section>
  );
}
