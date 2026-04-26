const CASE_METRICS = [
  { label: "Позиции", value: "42 ед." },
  { label: "Срок отгрузки", value: "3 дня" },
  { label: "Объект", value: "Насосная станция" },
] as const;

export function DeliveryCase() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-7 sm:p-10">
          <div className="mb-6 max-w-3xl">
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
              Пример поставки
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              От заявки до отгрузки без сдвига графика монтажа
            </h2>
            <p className="mt-3 text-base text-slate-600 sm:text-lg">
              Для подрядчика по инженерным сетям собрали партию арматуры по ТЗ,
              согласовали замену 2 позиций на складские аналоги и отгрузили в
              согласованный слот.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {CASE_METRICS.map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3"
              >
                <p className="text-xs uppercase tracking-[0.08em] text-slate-500">
                  {item.label}
                </p>
                <p className="mt-1 text-lg font-bold text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>

          <p className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 sm:text-base">
            Результат: объект вышел в монтаж по плану, без простоев и экстренных
            дозакупок.
          </p>
        </div>
      </div>
    </section>
  );
}
