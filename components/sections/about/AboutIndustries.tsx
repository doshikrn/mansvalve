import { Building2, Droplets, Factory, Flame, HardHat, Landmark } from "lucide-react";

const INDUSTRIES = [
  { title: "ТЭЦ и теплосетей", icon: Flame },
  { title: "Водоканалов и коммунальных предприятий", icon: Droplets },
  { title: "Нефтегазовых объектов", icon: Factory },
  { title: "Заводов и производственных предприятий", icon: Building2 },
  { title: "Генподрядчиков и строительных компаний", icon: HardHat },
  { title: "Государственных закупок и тендерных проектов", icon: Landmark },
] as const;

export function AboutIndustries() {
  return (
    <section className="bg-slate-50 py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="text-2xl font-bold text-site-ink sm:text-3xl">
          Комплексные поставки для бизнеса и государства
        </h2>
        <p className="mt-2 text-site-muted">Мы поставляем оборудование для:</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {INDUSTRIES.map(({ title, icon: Icon }) => (
            <div
              key={title}
              className="flex min-h-20 items-center gap-3 rounded-xl border border-site-border bg-white px-4 py-4"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-site-primary/10 text-site-primary">
                <Icon className="h-5 w-5" />
              </span>
              <p className="text-sm font-semibold text-site-ink">{title}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
