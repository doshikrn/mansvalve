const STEPS = [
  {
    num: "01",
    title: "ЗАЯВКА",
    desc: "Получаем ваш запрос или спецификацию.",
  },
  {
    num: "02",
    title: "КП ЗА 15 МИНУТ",
    desc: "Цена, наличие, сроки, документы.",
  },
  {
    num: "03",
    title: "ДОГОВОР",
    desc: "Официально с НДС, фиксируем условия.",
  },
  {
    num: "04",
    title: "ПОСТАВКА",
    desc: "Склад / завод / производство под заказ.",
  },
  {
    num: "05",
    title: "ДОСТАВКА",
    desc: "По адресу заказчика по всему Казахстану.",
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="site-section">
      <div className="site-container">
        <div className="mb-10 max-w-3xl">
          <div className="site-eyebrow">
            Как мы работаем
          </div>
          <h2 className="site-heading">
            От заявки до поставки — за 5 понятных шагов
          </h2>
        </div>

        <div className="relative">
          <div className="absolute left-0 right-0 top-7 hidden h-px bg-site-border lg:block" />

          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {STEPS.map((step) => (
              <li
                key={step.num}
                className="site-card relative flex flex-col p-5 lg:min-h-[190px]"
              >
                <div className="relative z-10 mb-5 flex h-14 w-14 items-center justify-center rounded-lg border border-site-primary/30 bg-site-card text-lg font-bold text-site-primary shadow-sm">
                  {step.num}
                </div>
                <h3 className="mb-2 text-sm font-bold uppercase text-site-ink sm:text-base">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-site-muted">
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
