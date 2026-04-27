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
    <section className="site-section">
      <div className="site-container">
        <div className="mb-10 max-w-3xl">
          <div className="site-eyebrow">
            С кем работаем
          </div>
          <h2 className="site-heading">
            Кому поставляем промышленную запорную арматуру
          </h2>
          <p className="site-copy mt-3">
            Работаем в сегментах B2B и B2G. Закрываем объектные поставки по договору с
            прогнозируемыми сроками, фиксированной спецификацией и полным комплектом документов.
          </p>
        </div>

        <ul className="grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2 md:gap-5">
          {SEGMENTS.map(({ icon: Icon, title, text }) => (
            <li
              key={title}
              className="site-card p-5 sm:p-6"
            >
              <div className="flex gap-4">
                <div className="site-icon">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-site-ink sm:text-[17px]">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-site-muted sm:text-[15px]">
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
