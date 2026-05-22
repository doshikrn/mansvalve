export default function CatalogLoading() {
  const cards = Array.from({ length: 6 });
  return (
    <div className="min-h-screen bg-site-bg">
      <section className="relative isolate overflow-hidden bg-[#081428]" aria-hidden>
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:py-14">
          <div className="site-skeleton-dark h-3 w-32 rounded-full" />
          <div className="site-skeleton-dark mt-5 h-9 w-3/4 max-w-2xl rounded-md sm:h-11" />
          <div className="site-skeleton-dark mt-3 h-4 w-2/3 max-w-xl rounded-md" />
          <div className="mt-6 flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="site-skeleton-dark h-6 w-28 rounded-full" />
            ))}
          </div>
        </div>
        <div className="h-[10px] bg-gradient-to-b from-[#081428] via-[#1b2b46] to-site-bg" />
      </section>

      <div
        className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10"
        aria-label="Загрузка каталога"
        aria-busy="true"
      >
        <div className="lg:grid lg:grid-cols-[minmax(260px,300px)_minmax(0,1fr)] lg:items-start lg:gap-8 xl:gap-10">
          <aside className="hidden lg:block">
            <div className="rounded-2xl border border-site-border bg-site-card p-5 shadow-sm">
              <div className="site-skeleton h-4 w-32 rounded" />
              <div className="site-skeleton mt-2 h-3 w-44 rounded" />
              <div className="mt-5 space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="site-skeleton h-10 w-full rounded-lg" />
                ))}
              </div>
            </div>
          </aside>

          <div>
            <div className="mb-5 flex items-center justify-between">
              <div className="site-skeleton h-4 w-40 rounded" />
              <div className="site-skeleton h-3 w-56 rounded" />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {cards.map((_, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-lg border border-site-border bg-site-card shadow-sm"
                >
                  <div className="site-skeleton aspect-[4/3] w-full" />
                  <div className="p-4">
                    <div className="flex flex-wrap gap-1.5">
                      {Array.from({ length: 4 }).map((__, j) => (
                        <div key={j} className="site-skeleton h-5 w-12 rounded-md" />
                      ))}
                    </div>
                    <div className="site-skeleton mt-3 h-4 w-5/6 rounded" />
                    <div className="site-skeleton mt-2 h-4 w-2/3 rounded" />
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="site-skeleton h-3 w-full rounded" />
                      <div className="site-skeleton h-3 w-full rounded" />
                    </div>
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
