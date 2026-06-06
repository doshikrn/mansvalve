import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, FileText, Mail, MessageCircle, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WhatsappIcon } from "@/components/icons/WhatsappIcon";
import {
  COMPANY,
  COMPANY_BRAND_SEO,
  COMPANY_EMAIL_HREF,
  COMPANY_PHONE_HREF,
  buildCompanyWhatsAppUrl,
} from "@/lib/company";

export const metadata: Metadata = {
  title: "Спасибо за заявку",
  description:
    "Спасибо за заявку. Менеджер MANSVALVE GROUP свяжется с вами по указанному телефону и подготовит коммерческое предложение в рабочее время.",
  alternates: {
    canonical: "/thank-you-page",
  },
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Спасибо за заявку",
    description:
      "Заявка получена и передана менеджеру MANSVALVE GROUP.",
    url: "/thank-you-page",
    siteName: COMPANY_BRAND_SEO,
    locale: "ru_KZ",
    type: "website",
  },
};

const WHATSAPP_URL = buildCompanyWhatsAppUrl(
  "Здравствуйте! Я оставил заявку на сайте MANSVALVE GROUP и хочу уточнить детали коммерческого предложения.",
);

export default function ThankYouPage() {
  return (
    <section className="bg-site-bg">
      <div className="mx-auto flex min-h-[62vh] max-w-4xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="h-9 w-9" aria-hidden="true" />
        </div>

        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-site-primary">
          Заявка отправлена
        </p>
        <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-site-ink sm:text-4xl">
          Спасибо, мы получили ваш запрос
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-site-muted sm:text-lg">
          Заявка сохранена и передана менеджеру. Мы свяжемся с вами по указанному телефону
          и подготовим коммерческое предложение в рабочее время.
        </p>

        <div className="mt-8 grid w-full gap-3 text-left sm:grid-cols-3">
          <div className="rounded-lg border border-site-border bg-white p-4">
            <Phone className="mb-3 h-5 w-5 text-site-primary" aria-hidden="true" />
            <p className="text-sm font-semibold text-site-ink">Свяжемся с вами</p>
            <p className="mt-1 text-sm text-site-muted">По телефону из заявки.</p>
          </div>
          <div className="rounded-lg border border-site-border bg-white p-4">
            <FileText className="mb-3 h-5 w-5 text-site-primary" aria-hidden="true" />
            <p className="text-sm font-semibold text-site-ink">Подготовим КП</p>
            <p className="mt-1 text-sm text-site-muted">В рабочее время после уточнения деталей.</p>
          </div>
          <div className="rounded-lg border border-site-border bg-white p-4">
            <MessageCircle className="mb-3 h-5 w-5 text-site-primary" aria-hidden="true" />
            <p className="text-sm font-semibold text-site-ink">Можно написать сразу</p>
            <p className="mt-1 text-sm text-site-muted">WhatsApp доступен для быстрых уточнений.</p>
          </div>
        </div>

        <div className="mt-8 w-full max-w-2xl rounded-2xl border border-site-border bg-white p-5 text-center sm:p-6">
          <p className="text-sm font-semibold text-site-ink">
            Хотите получить ответ быстрее? Свяжитесь с менеджером напрямую.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild className="border-0 !bg-site-whatsapp !text-white hover:!bg-site-whatsapp-hover">
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                <WhatsappIcon className="mr-2 h-4 w-4" />
                Написать в WhatsApp
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href={COMPANY_PHONE_HREF}>
                <Phone className="mr-2 h-4 w-4" />
                Позвонить
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href={COMPANY_EMAIL_HREF}>
                <Mail className="mr-2 h-4 w-4" />
                Отправить на почту
              </a>
            </Button>
          </div>
        </div>

        <div className="mt-6">
          <Button asChild variant="outline">
            <Link href="/catalog">Вернуться в каталог</Link>
          </Button>
        </div>

        <p className="mt-6 text-sm text-site-muted">
          Отдел продаж:{" "}
          <a className="font-semibold text-site-ink hover:text-site-primary" href={COMPANY_PHONE_HREF}>
            {COMPANY.phoneDisplay}
          </a>
        </p>
      </div>
    </section>
  );
}
