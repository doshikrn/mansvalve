export default function AdminMediaLoading() {
  return (
    <div className="space-y-4 p-1">
      <div className="site-skeleton h-4 w-28 rounded" />
      <div className="site-skeleton h-8 w-44 max-w-full rounded" />
      <div className="site-skeleton h-10 w-full max-w-md rounded-md" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="site-skeleton aspect-square rounded-lg" />
        ))}
      </div>
    </div>
  );
}
