export default function CatalogLoading() {
  const cards = Array.from({ length: 6 });
  return (
    <div className="min-h-screen bg-site-bg">
      <section className="border-b border-site-border bg-white" aria-hidden>
        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-8">
          <div className="site-skeleton h-3 w-32 rounded" />
          <div className="site-skeleton mt-5 h-9 w-3/4 max-w-2xl rounded-md" />
          <div className="site-skeleton mt-3 h-4 w-2/3 max-w-xl rounded-md" />
          <div className="mt-6 flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="site-skeleton h-7 w-28 rounded-md" />
            ))}
          </div>
        </div>
      </section>

      <div
        className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8"
        aria-label="Загрузка каталога"
        aria-busy="true"
      >
        <div className="lg:grid lg:grid-cols-[272px_minmax(0,1fr)] lg:items-start lg:gap-6">
          <aside className="hidden lg:block">
            <div className="rounded-lg border border-site-border bg-site-card p-5 shadow-sm">
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
            <div className="mb-4 flex h-16 items-center justify-between rounded-lg border border-site-border bg-white px-4">
              <div className="site-skeleton h-4 w-32 rounded" />
              <div className="site-skeleton h-10 w-64 rounded" />
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
