export default function AdminProductsLoading() {
  return (
    <div className="space-y-4 p-1">
      <div className="site-skeleton h-4 w-32 rounded" />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="site-skeleton h-8 w-48 max-w-full rounded" />
        <div className="site-skeleton h-9 w-32 rounded-md" />
      </div>
      <div className="site-skeleton h-10 w-full max-w-xl rounded-md" />
      <div className="site-skeleton h-64 w-full rounded-lg border border-slate-100" />
    </div>
  );
}
