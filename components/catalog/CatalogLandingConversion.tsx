import { ArrowDown, Search, ShieldCheck, Timer, Truck } from "lucide-react";

import { WhatsappIcon } from "@/components/icons/WhatsappIcon";
import { Button } from "@/components/ui/button";
import { QuickRequestForm } from "@/components/contacts/QuickRequestForm";
import { buildCompanyWhatsAppUrl } from "@/lib/company";

const TRUST_PILLS = [
  { label: "КП за 15 минут", Icon: Timer },
  { label: "Доставка по Казахстану", Icon: Truck },
  { label: "ГОСТ и сертификаты", Icon: ShieldCheck },
  { label: "Подбор аналога", Icon: Search },
] as const;

export interface CatalogLandingConversionProps {
  landingTitle: string;
  categoryName?: string;
  source?: string;
}

function buildLandingWhatsAppMessage(landingTitle: string, categoryName?: string): string {
  const topic = landingTitle.trim();
  const category = categoryName?.trim();
  if (category) {
    return `Здравствуйте! Интересует: ${topic} (${category}). Прошу подобрать и подготовить КП.`;
  }
  return `Здравствуйте! Интересует: ${topic}. Прошу подобрать и подготовить КП.`;
}

export function CatalogLandingConversion({
  landingTitle,
  categoryName,
  source = "catalog-landing",
}: CatalogLandingConversionProps) {
  const waUrl = buildCompanyWhatsAppUrl(buildLandingWhatsAppMessage(landingTitle, categoryName));

  return (
    <>
    <div
      className="mt-6 rounded-xl border border-site-border bg-site-bg p-4 sm:mt-8 sm:p-5"
      aria-label="Быстрый запрос по подбору"
    >
      <ul className="flex flex-wrap gap-2" role="list">
        {TRUST_PILLS.map(({ label, Icon }) => (
          <li key={label}>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-site-border bg-site-card px-3 py-1.5 text-xs font-medium text-slate-700">
              <Icon className="h-3.5 w-3.5 shrink-0 text-site-primary" strokeWidth={2} aria-hidden />
              <span className="whitespace-nowrap">{label}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
        <Button
          asChild
          size="lg"
          className="h-11 w-full border-0 !bg-site-whatsapp px-5 !text-white hover:!bg-site-whatsapp-hover sm:w-auto sm:min-w-[11rem]"
        >
          <a href={waUrl} target="_blank" rel="noopener noreferrer">
            <WhatsappIcon className="mr-2 h-4 w-4" />
            WhatsApp
          </a>
        </Button>
        <Button
          asChild
          size="lg"
          variant="outline"
          className="h-11 w-full border-site-border bg-site-card px-5 font-semibold sm:w-auto sm:min-w-[11rem]"
        >
          <a href="#request-name">
            Запросить КП
            <ArrowDown className="ml-1.5 h-4 w-4" />
          </a>
        </Button>
      </div>

      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500">
        Поможем подобрать по DN, PN и материалу — подберём аналог, если нужной позиции нет в
        списке. Ответим в рабочее время, подготовим коммерческое предложение за 15 минут.
      </p>
    </div>

    <div
      id="request-section"
      className="mt-4 scroll-mt-24 rounded-xl border border-site-border bg-site-card p-4 sm:p-5"
    >
      <p className="mb-3 text-sm font-semibold text-slate-900">
        Оставьте заявку — подберём и пришлём КП за 15 минут
      </p>
      <QuickRequestForm
        variant="light"
        source={source}
        productContext={{ productName: landingTitle, productCategory: categoryName }}
      />
    </div>
    </>
  );
}
