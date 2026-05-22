export default function AdminProductsLoading() {
  return (
    <div className="animate-pulse space-y-4 p-1">
      <div className="h-4 w-32 rounded bg-slate-200" />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="h-8 w-48 max-w-full rounded bg-slate-200" />
        <div className="h-9 w-32 rounded-md bg-slate-200" />
      </div>
      <div className="h-10 w-full max-w-xl rounded-md bg-slate-100" />
      <div className="h-64 w-full rounded-lg border border-slate-100 bg-slate-50" />
    </div>
  );
}
