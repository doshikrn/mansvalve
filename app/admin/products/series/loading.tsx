export default function AdminProductsSeriesLoading() {
  return (
    <div className="space-y-4 p-1">
      <div className="site-skeleton h-4 w-36 rounded" />
      <div className="site-skeleton h-8 w-52 max-w-full rounded" />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="site-skeleton h-32 rounded-lg border border-slate-100" />
        <div className="site-skeleton h-32 rounded-lg border border-slate-100" />
      </div>
      <div className="site-skeleton h-48 w-full rounded-lg border border-slate-100" />
    </div>
  );
}
