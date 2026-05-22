export default function CatalogHealthLoading() {
  return (
    <div className="space-y-5 p-1">
      <div className="site-skeleton h-4 w-40 rounded" />
      <div className="site-skeleton h-8 w-64 max-w-full rounded" />
      <div className="site-skeleton h-20 w-full rounded-lg" />
      <div className="flex flex-wrap gap-2">
        <div className="site-skeleton h-6 w-36 rounded-full" />
        <div className="site-skeleton h-6 w-32 rounded-full" />
        <div className="site-skeleton h-6 w-44 rounded-full" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="site-skeleton h-40 rounded-xl border border-slate-100" />
        ))}
      </div>
    </div>
  );
}
