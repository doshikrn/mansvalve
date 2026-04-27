import {
  Building2,
  Clock,
  FileCheck2,
  MapPin,
  ShieldCheck,
  Wallet,
} from "lucide-react";
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
    metric: "15 минут",
    title: "Коммерческое предложение за 15 минут",
    desc: "Подготовим актуальную цену, срок поставки и спецификацию в одном ответе.",
  },
  {
    icon: ShieldCheck,
    metric: "100% контроль",
    title: "Контроль качества перед отгрузкой",
    desc: "Проверка каждой партии, соответствие заявке и паспорт качества.",
  },
  {
    icon: Wallet,
    metric: "До 25% выгоднее",
    title: "Экономия до 25% на закупке",
    desc: "Прямые заводские контракты, оптимальная логистика и складской запас в Алматы.",
  },
  {
    icon: FileCheck2,
    metric: "ГОСТ / DIN / ISO",
    title: "Документы под тендер и объект",
    desc: "Сертификаты, паспорта, ГОСТ / DIN / ISO и полный комплект закрывающих документов.",
  },
  {
    icon: MapPin,
    metric: "Казахстан",
    title: "Поставка по всему Казахстану",
    desc: "Алматы, Астана, Шымкент и регионы — отгрузка точно в согласованный срок.",
  },
  {
    icon: Building2,
    metric: "B2B / B2G",
    title: "Работаем с бизнесом и госзаказчиками",
    desc: "Договор, НДС, спецификации, счета и сопровождение поставки до закрытия сделки.",
  },
];

export function WhyUs() {
  return (
    <section className="bg-site-bg py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 max-w-3xl">
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-site-primary">
            Преимущества
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
            Почему нас выбирают подрядчики, ТЭЦ, нефтегазовые и промышленные компании
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map(({ icon: Icon, metric, title, desc }) => (
            <div
              key={title}
              className="group rounded-2xl border border-site-border bg-site-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-site-primary hover:shadow-lg hover:shadow-slate-900/10"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#EFF6FF] text-site-primary transition-colors group-hover:bg-site-primary group-hover:text-white">
                <Icon className="h-6 w-6" />
              </div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-site-primary">
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
