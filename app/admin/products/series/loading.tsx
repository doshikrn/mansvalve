export default function AdminProductsSeriesLoading() {
  return (
    <div className="animate-pulse space-y-4 p-1">
      <div className="h-4 w-36 rounded bg-slate-200" />
      <div className="h-8 w-52 max-w-full rounded bg-slate-200" />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="h-32 rounded-lg border border-slate-100 bg-slate-50" />
        <div className="h-32 rounded-lg border border-slate-100 bg-slate-50" />
      </div>
      <div className="h-48 w-full rounded-lg border border-slate-100 bg-slate-50" />
    </div>
  );
}
