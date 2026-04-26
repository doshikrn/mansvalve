const STEPS = [
  {
    num: "01",
    title: "Заявка",
    desc: "ТЗ или DN/PN",
  },
  {
    num: "02",
    title: "КП",
    desc: "Цена и срок за 1 день",
  },
  {
    num: "03",
    title: "Договор",
    desc: "Фиксируем условия",
  },
  {
    num: "04",
    title: "Отгрузка",
    desc: "Склад или завод",
  },
  {
    num: "05",
    title: "Доставка",
    desc: "По Казахстану",
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-slate-50 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 max-w-2xl">
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
            Как мы работаем
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            5 шагов: от заявки до поставки
          </h2>
        </div>

        <div className="relative">
          <div className="absolute left-0 right-0 top-8 hidden h-px bg-slate-300 lg:block" />

          <ol className="grid gap-8 lg:grid-cols-5">
            {STEPS.map((step) => (
              <li
                key={step.num}
                className="relative flex flex-col items-center text-center lg:px-2"
              >
                <div className="relative z-10 mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-blue-300 bg-white text-lg font-bold text-blue-700 shadow-sm">
                  {step.num}
                </div>
                <h3 className="mb-1 text-sm font-semibold uppercase tracking-[0.06em] text-slate-900 sm:text-base">
                  {step.title}
                </h3>
                <p className="text-xs leading-snug text-slate-700 sm:text-sm">
                  {step.desc}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
