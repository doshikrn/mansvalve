export default function AdminMediaLoading() {
  return (
    <div className="animate-pulse space-y-4 p-1">
      <div className="h-4 w-28 rounded bg-slate-200" />
      <div className="h-8 w-44 max-w-full rounded bg-slate-200" />
      <div className="h-10 w-full max-w-md rounded-md bg-slate-100" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-lg bg-slate-100" />
        ))}
      </div>
    </div>
  );
}
