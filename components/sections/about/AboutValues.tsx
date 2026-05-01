import { Eye, ShieldCheck, Target } from "lucide-react";

const CORE_VALUES = [
  "Ответственность",
  "Профессионализм",
  "Скорость",
  "Партнерство",
  "Развитие",
] as const;

const VALUE_DETAILS = [
  "Мы соблюдаем обязательства и ценим доверие клиентов.",
  "Глубоко понимаем рынок, технические требования и специфику отрасли.",
  "Оперативно обрабатываем запросы и быстро предлагаем решения.",
  "Строим долгосрочные и взаимовыгодные отношения с клиентами и поставщиками.",
  "Постоянно совершенствуем сервис, процессы и качество работы.",
] as const;

const TRUST_ITEMS = [
  "Честные и прозрачные условия сотрудничества",
  "Реальные сроки поставки без пустых обещаний",
  "Гибкие решения под задачи клиента",
  "Поддержка на всех этапах сделки",
  "Ориентация на долгосрочное партнерство",
  "Репутация, основанная на результате",
] as const;

const STRATEGIC_BLOCKS = [
  {
    title: "Наша миссия",
    description:
      "Обеспечивать предприятия Казахстана и стран СНГ надежной промышленной арматурой, качественным сервисом и стабильными поставками, помогая бизнесу реализовывать проекты без простоев, задержек и лишних рисков.",
    icon: Target,
  },
  {
    title: "Наше видение",
    description:
      "Стать одной из ведущих компаний Казахстана в сфере поставок промышленной арматуры, формируя новые стандарты надежности, скорости и качества обслуживания на рынке B2B поставок.",
    icon: Eye,
  },
] as const;

export function AboutValues() {
  return (
    <section className="bg-[#061738] py-14 text-white sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="rounded-2xl border border-white/15 bg-white/5 p-6 sm:p-8">
          <h3 className="text-xl font-bold">Наш стандарт работы</h3>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-200">
            <p>
              Мы выстраиваем процесс поставки максимально удобно и прозрачно для клиента — от первого запроса до получения товара на объекте.
            </p>
            <p>
              Каждый заказ сопровождается вниманием к деталям, точностью сроков и персональной ответственностью за результат.
            </p>
            <p>
              Наша задача — не просто закрыть заявку, а обеспечить заказчику уверенность в поставщике, стабильность поставок и спокойствие за конечный результат.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/15 bg-white/5 p-6 sm:p-8">
          <h3 className="text-xl font-bold">Наши ценности</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CORE_VALUES.map((value, index) => (
              <div key={value} className="rounded-xl border border-white/15 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">{value}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-300">{VALUE_DETAILS[index]}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {STRATEGIC_BLOCKS.map(({ title, description, icon: Icon }) => (
            <div
              key={title}
              className="rounded-xl border border-white/15 bg-white/5 p-6 backdrop-blur-[1px]"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-blue-100">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-200">{description}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-white/15 bg-white/5 p-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-blue-100" />
            <h3 className="text-base font-semibold">Почему нам доверяют</h3>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {TRUST_ITEMS.map((item) => (
              <p key={item} className="text-sm text-slate-200">
                ✔️ {item}
              </p>
            ))}
          </div>
        </div>

        <p className="mt-6 text-center text-base font-semibold text-blue-100">
          MANSVALVE GROUP — когда важны сроки, качество и уверенность в поставщике.
        </p>
      </div>
    </section>
  );
}
