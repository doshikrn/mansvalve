const CLIENT_SEGMENTS = [
  "Генподрядчики и EPC-компании",
  "Промышленные заводы и цеха",
  "Монтажные и сервисные подрядчики",
  "Инфраструктурные и коммунальные объекты",
] as const;

export function WhoWeSupply() {
  return (
    <section className="bg-slate-50 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
          <div className="mb-6 max-w-2xl">
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
              С кем работаем
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Кому мы поставляем промышленную арматуру
            </h2>
            <p className="mt-3 text-base text-slate-600 sm:text-lg">
              Работаем в B2B-сегменте и закрываем объектные поставки под договор
              с прогнозируемыми сроками.
            </p>
          </div>

          <ul className="grid gap-3 text-sm sm:grid-cols-2 sm:text-base">
            {CLIENT_SEGMENTS.map((segment) => (
              <li
                key={segment}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium text-slate-800"
              >
                {segment}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
