export default function CatalogSlugLoading() {
  const cards = Array.from({ length: 6 });
  return (
    <div className="min-h-screen bg-site-bg">
      <div className="border-b border-site-border bg-site-card" aria-hidden>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="h-3 w-32 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 h-8 w-2/3 max-w-xl animate-pulse rounded bg-slate-200 sm:h-10" />
          <div className="mt-2 h-4 w-1/3 animate-pulse rounded bg-slate-100" />
          <div className="mt-6 h-40 w-full animate-pulse rounded-2xl bg-slate-100 sm:h-52" />
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
              <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
              <div className="mt-5 space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-10 w-full animate-pulse rounded-lg bg-slate-100" />
                ))}
              </div>
            </div>
          </aside>

          <div>
            <div className="mb-5 h-4 w-40 animate-pulse rounded bg-slate-200" />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {cards.map((_, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-lg border border-site-border bg-site-card shadow-sm"
                >
                  <div className="aspect-[4/3] w-full animate-pulse bg-slate-100" />
                  <div className="p-4">
                    <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200" />
                    <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-slate-100" />
                    <div className="mt-4 flex gap-2">
                      <div className="h-8 flex-1 animate-pulse rounded-md bg-slate-100" />
                      <div className="h-8 flex-1 animate-pulse rounded-md bg-slate-100" />
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
