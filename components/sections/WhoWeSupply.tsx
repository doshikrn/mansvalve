import {
  Building2,
  Droplets,
  Factory,
  Fuel,
  Landmark,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const SEGMENTS: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Building2,
    title: "Генподрядчики и EPC-компании",
    text: "Комплектация строительных и промышленных объектов по графику проекта.",
  },
  {
    icon: Fuel,
    title: "Нефтегазовые компании, ТЭЦ и энергетика",
    text: "Поставка арматуры для производственных, энергетических и технологических объектов.",
  },
  {
    icon: Factory,
    title: "Промышленные заводы и производственные предприятия",
    text: "Плановые закупки, модернизация и оперативная замена оборудования.",
  },
  {
    icon: Wrench,
    title: "Монтажные и сервисные подрядчики",
    text: "Быстрая комплектация объектов, ремонтов и аварийных заявок.",
  },
  {
    icon: Droplets,
    title: "Водоканалы, ЖКХ и инфраструктурные объекты",
    text: "Поставка для коммунальных сетей, водоснабжения и городских объектов.",
  },
  {
    icon: Landmark,
    title: "Государственные заказчики и тендерные проекты",
    text: "Работа по договору, спецификациям и требованиям закупочных процедур.",
  },
];

export function WhoWeSupply() {
  return (
    <section className="bg-site-bg py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 max-w-3xl">
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-site-primary">
            С кем работаем
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Кому поставляем промышленную запорную арматуру
          </h2>
          <p className="mt-3 text-base text-slate-600 sm:text-lg">
            Работаем в сегментах B2B и B2G. Закрываем объектные поставки по договору с
            прогнозируемыми сроками, фиксированной спецификацией и полным комплектом документов.
          </p>
        </div>

        <ul className="grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2 md:gap-5">
          {SEGMENTS.map(({ icon: Icon, title, text }) => (
            <li
              key={title}
              className="rounded-2xl border border-site-border bg-site-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-site-primary hover:shadow-md sm:p-6"
            >
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-site-primary">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-slate-900 sm:text-[17px]">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-500 sm:text-[15px]">
                    {text}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
