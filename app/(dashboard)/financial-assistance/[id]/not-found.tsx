export default function AssistanceRecordNotFound() {
  return (
    <div className="max-w-xl space-y-2">
      <h2 className="text-xl font-semibold text-slate-900">Assistance record not found</h2>
      <p className="text-sm text-slate-600">
        This assistance record does not exist or is no longer available.
      </p>
    </div>
  );
}
