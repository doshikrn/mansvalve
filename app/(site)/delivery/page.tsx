import type { Metadata } from "next";
import Link from "next/link";
import { Check, Package, Truck, FileText, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COMPANY } from "@/lib/company";

const PG_TITLE = "Доставка промышленной арматуры по Казахстану";

export const metadata: Metadata = {
  title: PG_TITLE,
  description: `Доставка трубопроводной и промышленной арматуры со склада в Алматы и по всему Казахстану транспортными компаниями. Сроки от наличия и региона. ${COMPANY.name}.`,
  alternates: {
    canonical: "/delivery",
  },
  openGraph: {
    title: `${PG_TITLE} | ${COMPANY.name}`,
    description: `Склад в Алматы, отправка ТК по РК. Паспорта и сертификаты в комплекте с поставкой. ${COMPANY.name}.`,
    url: "/delivery",
    siteName: COMPANY.name,
    locale: "ru_KZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${PG_TITLE} | ${COMPANY.name}`,
    description: `Доставка со склада в Алматы и по Казахстану. ${COMPANY.name}.`,
  },
};

const BULLETS = [
  {
    icon: Package,
    text: "Отгрузка со склада в Алматы: собираем заказ и передаём в доставку после согласования сроков.",
  },
  {
    icon: Truck,
    text: "Доставка по Казахстану транспортными компаниями — удобный способ для регионов; терминал и сроки согласовываем под вашу задачу.",
  },
  {
    icon: Clock,
    text: "Сроки зависят от наличия позиций на складе и региона назначения; при необходимости согласуем поставку под сроки монтажа.",
  },
  {
    icon: FileText,
    text: "Документы и сертификаты передаются вместе с поставкой — комплект в соответствии с отгружаемой арматурой.",
  },
] as const;

export default function DeliveryPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
          <p className="text-sm font-medium text-blue-700">Логистика</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {PG_TITLE}
          </h1>
          <p className="mt-3 max-w-2xl text-base text-slate-600 sm:text-lg">
            Организуем поставку задвижек, кранов, клапанов и сопутствующей арматуры с удобной для вас
            схемой: склад в Алматы, отправка в регионы и вся сопутствующая отгрузочная документация.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="mb-8 flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50/80 px-4 py-3 text-sm text-slate-700">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" aria-hidden />
          <p>
            База и отгрузка: <span className="font-medium">г. Алматы</span> — дальнейшая логистика по
            согласованию.
          </p>
        </div>

        <ul className="space-y-4">
          {BULLETS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex gap-3 text-slate-700">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-blue-700">
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <p className="pt-0.5 leading-relaxed">{text}</p>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Check className="h-4 w-4 text-green-600" aria-hidden />
            Нужен расчёт и срок? Оставьте заявку — ответим с КП.
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="bg-blue-700 text-white hover:bg-blue-600">
            <Link href="/#request-section">Получить коммерческое предложение</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/contacts">Контакты</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
