export default function CatalogHealthLoading() {
  return (
    <div className="animate-pulse space-y-5 p-1">
      <div className="h-4 w-40 rounded bg-slate-200" />
      <div className="h-8 w-64 max-w-full rounded bg-slate-200" />
      <div className="h-20 w-full rounded-lg bg-slate-100" />
      <div className="flex flex-wrap gap-2">
        <div className="h-6 w-36 rounded-full bg-slate-200" />
        <div className="h-6 w-32 rounded-full bg-slate-200" />
        <div className="h-6 w-44 rounded-full bg-slate-200" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-40 rounded-xl border border-slate-100 bg-slate-50" />
        ))}
      </div>
    </div>
  );
}
