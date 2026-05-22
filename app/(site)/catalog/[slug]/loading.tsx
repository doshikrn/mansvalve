export default function CatalogSlugLoading() {
  const cards = Array.from({ length: 6 });
  return (
    <div className="min-h-screen bg-site-bg">
      <div className="border-b border-site-border bg-site-card" aria-hidden>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="site-skeleton h-3 w-32 rounded" />
          <div className="site-skeleton mt-4 h-8 w-2/3 max-w-xl rounded sm:h-10" />
          <div className="site-skeleton mt-2 h-4 w-1/3 rounded" />
          <div className="site-skeleton mt-6 h-40 w-full rounded-2xl sm:h-52" />
        </div>
      </div>

      <div
        className="mx-auto max-w-7xl px-4 py-8 sm:px-6"
        aria-label="Загрузка категории"
        aria-busy="true"
      >
        <div className="lg:grid lg:grid-cols-[minmax(260px,300px)_minmax(0,1fr)] lg:items-start lg:gap-8 xl:gap-10">
          <aside className="hidden lg:block">
            <div className="rounded-2xl border border-site-border bg-site-card p-5 shadow-sm">
              <div className="site-skeleton h-4 w-32 rounded" />
              <div className="mt-5 space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="site-skeleton h-10 w-full rounded-lg" />
                ))}
              </div>
            </div>
          </aside>

          <div>
            <div className="site-skeleton mb-5 h-4 w-40 rounded" />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {cards.map((_, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-lg border border-site-border bg-site-card shadow-sm"
                >
                  <div className="site-skeleton aspect-[4/3] w-full" />
                  <div className="p-4">
                    <div className="site-skeleton h-4 w-5/6 rounded" />
                    <div className="site-skeleton mt-2 h-4 w-2/3 rounded" />
                    <div className="mt-4 flex gap-2">
                      <div className="site-skeleton h-8 flex-1 rounded-md" />
                      <div className="site-skeleton h-8 flex-1 rounded-md" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
