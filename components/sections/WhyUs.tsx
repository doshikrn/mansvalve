import { Clock, ShieldCheck, Wallet, FileCheck2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface AdvantageItem {
  icon: LucideIcon;
  metric: string;
  title: string;
  desc: string;
}

const ITEMS: AdvantageItem[] = [
  {
    icon: Clock,
    metric: "1 день",
    title: "КП за 1 рабочий день",
    desc: "Фиксируем цену, срок и спецификацию в одном ответе.",
  },
  {
    icon: ShieldCheck,
    metric: "100% контроль",
    title: "Контроль перед отгрузкой",
    desc: "Паспорт качества и проверка каждой партии.",
  },
  {
    icon: Wallet,
    metric: "до -25%",
    title: "Экономия до 25%",
    desc: "Прямые заводские контракты и складской запас в Алматы.",
  },
  {
    icon: FileCheck2,
    metric: "ГОСТ / DIN / ISO",
    title: "Документы под тендер",
    desc: "ГОСТ, DIN, ISO и закрывающие документы под объект.",
  },
];

export function WhyUs() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 max-w-2xl">
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
            Преимущества
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Почему с нами работают подрядчики
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map(({ icon: Icon, metric, title, desc }) => (
            <div
              key={title}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-[0_16px_30px_-18px_rgba(30,64,175,0.45)]"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700 transition-colors group-hover:bg-blue-700 group-hover:text-white">
                <Icon className="h-6 w-6" />
              </div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-blue-700">
                {metric}
              </p>
              <h3 className="mb-1 text-base font-bold text-slate-950 sm:text-[17px]">
                {title}
              </h3>
              <p className="text-sm leading-snug text-slate-500">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
