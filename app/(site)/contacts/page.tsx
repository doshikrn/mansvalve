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
import {
  buildContactsMapLines,
  ContactsMapBlock,
} from "@/components/contacts/ContactsMapBlock";
import { CopyToClipboard } from "@/components/contacts/CopyToClipboard";
import { QuickRequestForm } from "@/components/contacts/QuickRequestForm";
import { COMPANY, COMPANY_BRAND_SEO, buildCompanyContactsQuickCardWhatsAppUrl } from "@/lib/company";
import { WhatsappIcon } from "@/components/icons/WhatsappIcon";
import { resolveContactsPage } from "@/lib/site-content/public";

/* ── SEO ──────────────────────────────────────────────────────────── */

export async function generateMetadata(): Promise<Metadata> {
  const page = await resolveContactsPage();
  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: {
      canonical: "/contacts",
    },
    openGraph: {
      title: page.metaTitle,
      description: page.metaDescription,
      url: "/contacts",
      siteName: COMPANY_BRAND_SEO,
      locale: "ru_KZ",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: page.metaTitle,
      description: page.metaDescription,
    },
  };
}

const CONTACT_ICONS: LucideIcon[] = [Phone, Mail, MapPin, Clock];
const CONTACTS_LEAD =
  "Работаем с B2B-клиентами по всему Казахстану, обеспечивая надежные поставки промышленной арматуры и инженерного оборудования. Подготовим коммерческое предложение с ценой, сроками и условиями поставки в течение 15 минут в рабочее время.";
const WORK_DIRECTIONS = [
  "Государственные закупки",
  "Промышленные предприятия",
  "Строительные компании",
  "ТЭЦ и теплосети",
  "Водоканалы и коммунальный сектор",
] as const;

/* ── Page ─────────────────────────────────────────────────────────── */

export default async function ContactsPage() {
  const page = await resolveContactsPage();
  const WA_URL = buildCompanyContactsQuickCardWhatsAppUrl();

  const mapLines = buildContactsMapLines({
    cityTemplate: page.mapCityLineTemplate,
    streetTemplate: page.mapStreetLineTemplate,
    addressFullTemplate: page.mapBottomAddressLineTemplate,
    companyName: COMPANY.name,
    city: COMPANY.address.city,
    street: COMPANY.address.street,
    addressFull: COMPANY.address.full,
    legalName: COMPANY.legalName,
  });

  const REQUISITES = [
    { label: page.requisitesRowLabels[0]!, value: COMPANY.legalName },
    { label: page.requisitesRowLabels[1]!, value: COMPANY.bankDetails.bin },
    { label: page.requisitesRowLabels[2]!, value: COMPANY.bankDetails.bankName },
    { label: page.requisitesRowLabels[3]!, value: COMPANY.bankDetails.iik },
    { label: page.requisitesRowLabels[4]!, value: COMPANY.bankDetails.bik },
  ] as const;

  const cards: Array<{
    icon: LucideIcon;
    label: string;
    lines: string[];
    copy?: { value: string; kind: "phone" | "email" };
    href: string | null;
    hrefLabel: string | null;
    external: boolean;
  }> = [
    {
      icon: CONTACT_ICONS[0]!,
      label: page.contactCardLabels[0]!,
      lines: [COMPANY.phoneDisplay],
      copy: { value: COMPANY.phoneE164, kind: "phone" },
      href: null,
      hrefLabel: null,
      external: false,
    },
    {
      icon: CONTACT_ICONS[1]!,
      label: page.contactCardLabels[1]!,
      lines: [COMPANY.email],
      copy: { value: COMPANY.email, kind: "email" },
      href: null,
      hrefLabel: null,
      external: false,
    },
    {
      icon: CONTACT_ICONS[2]!,
      label: page.contactCardLabels[2]!,
      lines: [`г. ${COMPANY.address.city}`, COMPANY.address.street],
      copy: undefined,
      href: COMPANY.address.mapUrl,
      hrefLabel: page.mapLinkLabel,
      external: true,
    },
    {
      icon: CONTACT_ICONS[3]!,
      label: page.contactCardLabels[3]!,
      lines: ["Пн–Пт: 09:00–18:00", "Сб–Вс: по согласованию"],
      copy: undefined,
      href: null,
      hrefLabel: null,
      external: false,
    },
  ];

  return (
    <div className="min-h-screen bg-site-bg">
      {/* ── Page header ─────────────────────────────────────────────── */}
      <div className="border-b border-site-border bg-site-card">
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
                  {page.breadcrumbLabel}
                </span>
              </li>
            </ol>
          </nav>

          <h1 className="mb-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {page.h1}
          </h1>
          <p className="max-w-3xl text-lg text-slate-500">{CONTACTS_LEAD}</p>
        </div>
      </div>

      {/* ── Main: form + contact info ────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-5 lg:gap-16">
          {/* LEFT — request form (3 / 5 columns) */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-site-border bg-site-card p-8 shadow-sm lg:p-10">
              <div className="mb-7">
                <h2 className="mb-2 text-xl font-bold text-slate-900">{page.formTitle}</h2>
                <p className="text-sm text-slate-500">{page.formHelper}</p>
              </div>
              <QuickRequestForm source="contacts-page" />
            </div>
          </div>

          {/* RIGHT — contact cards (2 / 5 columns) */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            {cards.map(({ icon: Icon, label, lines, copy: clip, href, hrefLabel, external }) => (
              <div
                key={label}
                className="flex gap-4 rounded-xl border border-site-border bg-site-card p-5 transition-colors hover:border-site-primary/40"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF]">
                  <Icon size={18} className="text-site-primary" strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-400">
                    {label}
                  </p>
                  {lines.map((line) => (
                    <p key={line} className="text-sm font-medium leading-relaxed text-slate-900">
                      {clip ? (
                        <CopyToClipboard
                          variant="minimal"
                          value={clip.value}
                          messageForCopyToast={line}
                          kind={clip.kind}
                          className="font-medium text-slate-900"
                        >
                          {line}
                        </CopyToClipboard>
                      ) : (
                        line
                      )}
                    </p>
                  ))}
                  {href && hrefLabel ? (
                    <a
                      href={href}
                      target={external ? "_blank" : undefined}
                      rel={external ? "noopener noreferrer" : undefined}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-site-primary transition-colors hover:underline"
                    >
                      {hrefLabel} →
                    </a>
                  ) : null}
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
                <p className="text-sm font-semibold text-slate-900">{page.whatsAppTitle}</p>
                <p className="mt-0.5 text-xs text-slate-500">{page.whatsAppSubtitle}</p>
              </div>
            </a>

            <div className="rounded-xl border border-site-border bg-site-card p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
                Направления работы
              </p>
              <ul className="space-y-2">
                {WORK_DIRECTIONS.map((item) => (
                  <li key={item} className="text-sm font-medium text-slate-900">
                    ✔️ {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ── Как нас найти ───── */}
      <div className="border-t border-site-border bg-site-bg">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <h2 className="mb-6 text-xl font-bold text-slate-900">{page.mapSectionTitle}</h2>
          <ContactsMapBlock
            backgroundImageSrc={page.mapBackgroundImageSrc}
            pinEyebrow={page.mapPinEyebrow}
            cityLine={mapLines.cityLine}
            streetLine={mapLines.streetLine}
            openMapLabel={page.mapOpenLabel}
            bottomAddressLine={mapLines.bottomAddressLine}
            bottomMapPrefix={page.mapBottomMapPrefix}
            bottomMapLinkLabel={page.mapBottomMapLinkLabel}
          />
        </div>
      </div>

      {/* ── Requisites ──────────────────────────────────────────────── */}
      <div className="border-t border-site-border bg-site-card">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EFF6FF]">
              <FileText size={16} className="text-site-primary" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">{page.requisitesTitle}</h2>
          </div>

          <div className="overflow-hidden rounded-xl border border-site-border">
            <table className="w-full text-sm">
              <tbody>
                {REQUISITES.map(({ label, value }, idx) => (
                  <tr
                    key={label}
                    className={idx % 2 === 0 ? "bg-site-card" : "bg-site-bg"}
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
            {page.requisitesFooterNote}
          </p>
          <p className="mt-4 text-sm font-semibold text-slate-900">
            MANSVALVE GROUP — быстрый ответ, точные сроки, надежные поставки.
          </p>
        </div>
      </div>
    </div>
  );
}
