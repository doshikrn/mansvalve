import type { Metadata } from "next";
import Link from "next/link";
import {
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Clock,
  FileText,
  Building2,
  type LucideIcon,
} from "lucide-react";
import { ContactsMapBlock } from "@/components/contacts/ContactsMapBlock";
import { CopyToClipboard } from "@/components/contacts/CopyToClipboard";
import { QuickRequestForm } from "@/components/contacts/QuickRequestForm";
import { COMPANY, buildCompanyContactsQuickCardWhatsAppUrl } from "@/lib/company";
import { WhatsappIcon } from "@/components/icons/WhatsappIcon";
import { resolveContactsCopy, resolveContactsMeta } from "@/lib/site-content/public";

/* ── SEO ──────────────────────────────────────────────────────────── */

export async function generateMetadata(): Promise<Metadata> {
  const meta = await resolveContactsMeta();
  const socialTitle = `${meta.title} | ${COMPANY.name}`;
  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: "/contacts",
    },
    openGraph: {
      title: socialTitle,
      description: meta.description,
      url: "/contacts",
      siteName: COMPANY.name,
      locale: "ru_KZ",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: meta.description,
    },
  };
}

/* ── Static data ─────────────────────────────────────────────────── */

const CONTACTS: Array<{
  icon: LucideIcon;
  label: string;
  lines: string[];
  copy?: { value: string; kind: "phone" | "email" };
  href: string | null;
  hrefLabel: string | null;
  external: boolean;
}> = [
  {
    icon: Phone,
    label: "Телефон / WhatsApp",
    lines: [COMPANY.phoneDisplay],
    copy: { value: COMPANY.phoneE164, kind: "phone" },
    href: null,
    hrefLabel: null,
    external: false,
  },
  {
    icon: Mail,
    label: "Электронная почта",
    lines: [COMPANY.email],
    copy: { value: COMPANY.email, kind: "email" },
    href: null,
    hrefLabel: null,
    external: false,
  },
  {
    icon: MapPin,
    label: "Офис и склад",
    lines: [`г. ${COMPANY.address.city}`, COMPANY.address.street],
    href: COMPANY.address.mapUrl,
    hrefLabel: "Открыть в 2GIS",
    external: true,
  },
  {
    icon: Clock,
    label: "Время работы",
    lines: ["Пн – Пт: 09:00 – 18:00", "Сб – Вс: выходной"],
    href: null,
    hrefLabel: null,
    external: false,
  },
];

const REQUISITES = [
  { label: "Полное наименование", value: COMPANY.legalName },
  { label: "БИН", value: COMPANY.bankDetails.bin },
  { label: "Банк", value: COMPANY.bankDetails.bankName },
  { label: "ИИК", value: COMPANY.bankDetails.iik },
  { label: "БИК", value: COMPANY.bankDetails.bik },
] as const;

const WA_URL = buildCompanyContactsQuickCardWhatsAppUrl();

/* ── Page ─────────────────────────────────────────────────────────── */

export default async function ContactsPage() {
  const copy = await resolveContactsCopy();

  return (
    <div className="min-h-screen bg-white">

      {/* ── Page header ─────────────────────────────────────────────── */}
      <div className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">

          {/* Breadcrumbs */}
          <nav aria-label="Хлебные крошки" className="mb-5">
            <ol className="flex items-center gap-1.5 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Главная
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight size={14} className="text-slate-400" />
              </li>
              <li>
                <span className="font-medium text-slate-900" aria-current="page">
                  Контакты
                </span>
              </li>
            </ol>
          </nav>

          <h1 className="mb-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Контакты
          </h1>
          <p className="max-w-xl text-lg text-slate-500">{copy.pageLead}</p>
        </div>
      </div>

      {/* ── Main: form + contact info ────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-5 lg:gap-16">

          {/* LEFT — request form (3 / 5 columns) */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm lg:p-10">
              <div className="mb-7">
                <h2 className="mb-2 text-xl font-bold text-slate-900">{copy.formTitle}</h2>
                <p className="text-sm text-slate-500">{copy.formHelper}</p>
              </div>
              <QuickRequestForm source="contacts-page" />
            </div>
          </div>

          {/* RIGHT — contact cards (2 / 5 columns) */}
          <div className="flex flex-col gap-4 lg:col-span-2">

            {CONTACTS.map(({ icon: Icon, label, lines, copy, href, hrefLabel, external }) => (
              <div
                key={label}
                className="flex gap-4 rounded-xl border border-slate-200 bg-white p-5 hover:border-slate-300 transition-colors"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                  <Icon size={18} className="text-blue-700" strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-400">
                    {label}
                  </p>
                  {lines.map((line) => (
                    <p key={line} className="text-sm font-medium leading-relaxed text-slate-900">
                      {copy ? (
                        <CopyToClipboard
                          variant="minimal"
                          value={copy.value}
                          kind={copy.kind}
                          className="font-medium text-slate-900"
                        >
                          {line}
                        </CopyToClipboard>
                      ) : (
                        line
                      )}
                    </p>
                  ))}
                  {href && hrefLabel && (
                    <a
                      href={href}
                      target={external ? "_blank" : undefined}
                      rel={external ? "noopener noreferrer" : undefined}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline transition-colors"
                    >
                      {hrefLabel} →
                    </a>
                  )}
                </div>
              </div>
            ))}

            {/* WhatsApp quick link */}
            <a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-xl border border-green-200 bg-green-50 p-5 transition-colors hover:bg-green-100"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-500">
                <WhatsappIcon className="h-[18px] w-[18px] text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Написать в WhatsApp
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Отвечаем в течение 15 минут
                </p>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* ── Как нас найти (статичная визуализация, ссылка на 2GIS) ───── */}
      <div className="border-t border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <h2 className="mb-6 text-xl font-bold text-slate-900">
            Как нас найти
          </h2>
          <ContactsMapBlock />
        </div>
      </div>

      {/* ── Requisites ──────────────────────────────────────────────── */}
      <div className="border-t border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
              <FileText size={16} className="text-blue-700" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Реквизиты</h2>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <tbody>
                {REQUISITES.map(({ label, value }, idx) => (
                  <tr
                    key={label}
                    className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}
                  >
                    <td className="w-1/2 border-r border-slate-100 px-5 py-3.5 font-medium text-slate-500 lg:w-1/3">
                      {label}
                    </td>
                    <td className="px-5 py-3.5 font-mono font-semibold text-slate-900">
                      {value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-400">
            <Building2 size={13} />
            Полные реквизиты для заключения договора предоставляются по запросу.
          </p>
        </div>
      </div>
    </div>
  );
}
