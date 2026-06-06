import Link from "next/link";
import { ArrowRight, FolderCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DOCUMENTS_TRUST_ITEMS } from "@/components/sections/DocumentsTrust";
import { FAQAccordion } from "@/components/sections/FAQAccordion";
import { HOME_FAQ_ITEMS } from "@/components/sections/FAQ";
import { RequestCtaClient } from "@/components/sections/RequestCtaClient";
import { buildCompanyWhatsAppUrl } from "@/lib/company";
import { resolveRequestCta } from "@/lib/site-content/public";

const REQUEST_DOCS_WA_MESSAGE =
  "Здравствуйте! Нужны документы (сертификаты, паспорта, КП) по позиции из каталога.";

export async function ContactHubSection() {
  const { title, subtitle, footerHint } = await resolveRequestCta();

  return (
    <section
      className="relative overflow-hidden border-t border-site-deep bg-site-deep py-12 sm:py-14 lg:py-16"
      aria-label="Заявка, документы и ответы на вопросы"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,#061024_0%,#081428_48%,#10192a_100%)]"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_52%_at_16%_0%,rgba(47,107,255,0.18),transparent_58%)]" aria-hidden />
      <div className="site-container relative grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.08fr)_minmax(0,0.95fr)] lg:items-start">
        <aside className="order-3 min-w-0 rounded-xl border border-white/10 bg-white/[0.045] p-5 shadow-[0_28px_64px_-44px_rgba(0,0,0,0.9)] lg:order-1 lg:p-6">
          <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-site-primary/25 bg-site-primary/12 text-site-soft-blue">
            <FolderCheck className="h-6 w-6" aria-hidden />
          </span>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-site-soft-blue">Документы и качество</p>
          <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">Все документы — в одном пакете</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            Сертификаты, паспорта, КП с НДС и отгрузочные документы — без сюрпризов при заказе.
          </p>
          <ul className="mt-5 space-y-3">
            {DOCUMENTS_TRUST_ITEMS.map(({ Icon, title: docTitle, text }) => (
              <li
                key={docTitle}
                className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.055] px-3 py-3 transition-colors hover:border-site-primary/30 hover:bg-white/[0.075]"
              >
                <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-site-primary/25 bg-site-primary/12 text-site-soft-blue">
                  <Icon className="h-4 w-4" aria-hidden strokeWidth={1.9} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-white">{docTitle}</span>
                  <span className="mt-0.5 block text-xs leading-snug text-slate-400">{text}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-col gap-2">
            <Button asChild size="sm" className="site-primary-cta h-10 w-full justify-center px-4 text-sm">
              <a
                href={buildCompanyWhatsAppUrl(REQUEST_DOCS_WA_MESSAGE)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Запросить документы
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </a>
            </Button>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="h-10 w-full justify-center border-white/15 bg-white/[0.04] px-4 text-sm text-slate-100 hover:border-white/25 hover:bg-white/[0.08] hover:text-white"
            >
              <Link href="/certificates">Все сертификаты</Link>
            </Button>
          </div>
        </aside>

        <div className="order-1 min-w-0 rounded-xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_28px_64px_-44px_rgba(0,0,0,0.9)] lg:order-2 lg:p-6">
          <RequestCtaClient
            title={title}
            subtitle={subtitle}
            footerHint={footerHint}
            layout="embedded"
          />
        </div>

        <div className="order-2 min-w-0 rounded-xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_28px_64px_-44px_rgba(0,0,0,0.9)] lg:order-3 lg:p-6">
          <FAQAccordion
            variant="embedded"
            sectionEyebrow="Часто задаваемые вопросы"
            sectionTitle="Ответы перед заявкой"
            items={[...HOME_FAQ_ITEMS]}
          />
        </div>
      </div>
    </section>
  );
}
