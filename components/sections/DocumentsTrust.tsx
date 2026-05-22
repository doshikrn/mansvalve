import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  FileText,
  Receipt,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { buildCompanyWhatsAppUrl } from "@/lib/company";

const REQUEST_DOCS_WA_MESSAGE =
  "Здравствуйте! Нужны документы (сертификаты, паспорта, КП) по позиции из каталога.";

const DOCS = [
  {
    Icon: ShieldCheck,
    title: "Сертификаты соответствия",
    text: "ГОСТ, DIN, ISO. Высылаем по позиции до отгрузки — копии и оригиналы при необходимости.",
  },
  {
    Icon: FileText,
    title: "Паспорта и инструкции",
    text: "На каждую позицию — паспорт производителя, инструкция по монтажу и эксплуатации.",
  },
  {
    Icon: Receipt,
    title: "КП и счёт-фактура",
    text: "Коммерческое предложение, счёт-фактура, ЭСФ. Работаем с НДС, договор — по запросу.",
  },
  {
    Icon: BadgeCheck,
    title: "Отгрузка по ГОСТ",
    text: "Упаковка по нормам, акт приёма-передачи, ТТН. Доставка по Казахстану.",
  },
] as const;

export function DocumentsTrust() {
  return (
    <section
      className="site-section"
      aria-labelledby="docs-trust-heading"
    >
      <div className="site-container">
        <div className="mx-auto mb-8 max-w-3xl text-center sm:mb-10">
          <p className="site-eyebrow mx-auto">Документы и комплаенс</p>
          <h2 id="docs-trust-heading" className="site-heading">
            Все документы для бухгалтерии и проекта — в одном пакете
          </h2>
          <p className="mt-3 text-base leading-relaxed text-site-muted sm:text-lg">
            Закрытый список того, что вы получаете при заказе. Без сюрпризов: сертификаты по
            позиции, паспорта, КП с НДС, отгрузочные документы по ГОСТ.
          </p>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DOCS.map(({ Icon, title, text }) => (
            <li key={title} className="h-full">
              <div className="site-card-quiet flex h-full flex-col p-5 transition-colors hover:border-site-primary/35">
                <span className="site-icon mb-4 h-11 w-11 border border-site-primary/15">
                  <Icon className="h-5 w-5" aria-hidden strokeWidth={1.9} />
                </span>
                <h3 className="text-[15px] font-bold tracking-tight text-site-ink">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-site-muted">{text}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
          <Button asChild size="lg" className="site-primary-cta h-12 px-6 text-base">
            <a
              href={buildCompanyWhatsAppUrl(REQUEST_DOCS_WA_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Запросить документы по позиции
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </a>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-12 border-site-border bg-white px-6 text-base text-site-ink hover:border-site-primary/45 hover:bg-site-bg"
          >
            <Link href="/certificates">
              Перейти в раздел сертификатов
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <p className="mt-4 text-center text-xs text-site-muted">
          ТОО на ОУР с НДС · Договор поставки и спецификации — на ваш бланк или наш.
        </p>
      </div>
    </section>
  );
}
