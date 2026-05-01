import Image from "next/image";
import Link from "next/link";
import {
  Award,
  Building2,
  ChevronRight,
  Clock,
  FileText,
  Mail,
  MapPin,
  Phone,
  Shield,
  Truck,
  Users,
} from "lucide-react";
import {
  buildCompanyContactsQuickCardWhatsAppUrl,
  buildCompanyWhatsAppUrl,
  COMPANY,
  COMPANY_EMAIL_HREF,
  COMPANY_PHONE_HREF,
} from "@/lib/company";
import { HEADER_LOGO_SRC } from "@/components/layout/header-logo";
import { WhatsappIcon } from "@/components/icons/WhatsappIcon";
import { applyYearPlaceholder } from "@/lib/site-content/models";
import {
  resolveFooterMain,
  resolveFooterPreCta,
  resolveFooterTrustBar,
} from "@/lib/site-content/public";

const TRUST_ICONS = [Shield, Award, Truck, Building2, Users] as const;

export async function Footer() {
  const [preCta, trustBar, main] = await Promise.all([
    resolveFooterPreCta(),
    resolveFooterTrustBar(),
    resolveFooterMain(),
  ]);

  const waKpUrl = buildCompanyWhatsAppUrl(preCta.kpWhatsAppMessage);
  const waContactUrl = buildCompanyContactsQuickCardWhatsAppUrl();

  const logoSrc = main.brandLogoSrc.trim() || HEADER_LOGO_SRC;
  const year = new Date().getFullYear();
  const copyright = applyYearPlaceholder(main.bottomCopyright, year);

  return (
    <footer className="mt-auto">
      <section
        className="border-b border-site-border bg-site-bg"
        aria-labelledby="footer-pre-cta-heading"
      >
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start lg:items-center lg:gap-5">
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-site-primary text-white shadow-sm shadow-blue-900/10 sm:h-[4.5rem] sm:w-[4.5rem]"
                aria-hidden
              >
                <div className="relative flex h-10 w-10 items-center justify-center">
                  <FileText className="absolute h-9 w-9 opacity-95" strokeWidth={1.5} />
                  <Clock className="relative h-4 w-4 translate-x-2 translate-y-2 drop-shadow" strokeWidth={2.5} />
                </div>
              </div>
              <div className="max-w-xl text-center sm:text-left">
                <h2
                  id="footer-pre-cta-heading"
                  className="text-lg font-bold tracking-tight text-site-ink sm:text-xl"
                >
                  {preCta.title}
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-site-muted sm:text-[15px]">{preCta.subtitle}</p>
              </div>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center lg:w-auto lg:max-w-md lg:flex-nowrap lg:justify-end">
              <a
                href={waKpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[3.25rem] flex-1 items-center justify-center gap-2.5 rounded-lg bg-site-whatsapp px-4 py-2.5 text-white shadow-sm transition hover:bg-site-whatsapp-hover sm:min-w-[200px] lg:flex-initial"
              >
                <WhatsappIcon className="h-5 w-5 shrink-0 self-center text-white" aria-hidden />
                <span className="min-w-0 text-left">
                  <span className="block text-sm font-bold leading-snug">{preCta.whatsappPrimary}</span>
                  <span className="mt-0.5 block text-[11px] font-medium leading-tight text-white/90">
                    {preCta.whatsappSecondary}
                  </span>
                </span>
              </a>
              <a
                href={COMPANY_EMAIL_HREF}
                className="inline-flex min-h-[3.25rem] flex-1 items-center justify-center gap-2.5 rounded-lg border border-site-border bg-white px-4 py-2.5 text-site-ink shadow-sm transition hover:border-site-primary/45 hover:bg-site-bg sm:min-w-[200px] lg:flex-initial"
              >
                <Mail className="h-5 w-5 shrink-0 self-center text-slate-800" strokeWidth={2} aria-hidden />
                <span className="min-w-0 text-left">
                  <span className="block text-sm font-bold leading-snug">{preCta.emailPrimary}</span>
                  <span className="mt-0.5 block text-[11px] font-medium leading-tight text-slate-500">
                    {preCta.emailSecondary}
                  </span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-site-border bg-site-surface" aria-label="Преимущества компании">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-5 lg:gap-4">
            {trustBar.items.map((text, i) => {
              const Icon = TRUST_ICONS[i] ?? Shield;
              return (
                <li
                  key={`${text}-${i}`}
                  className={
                    "relative flex gap-3 rounded-lg border border-site-border/80 bg-white px-3.5 py-3 shadow-[0_8px_18px_-16px_rgba(15,27,45,0.35)] lg:pl-4"
                  }
                >
                  <div className="absolute inset-x-0 top-0 h-0.5 rounded-t-lg bg-gradient-to-r from-site-primary/0 via-site-primary/45 to-site-primary/0" />
                  <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-site-primary/20 bg-site-primary/10">
                    <Icon className="h-4 w-4 text-site-primary" strokeWidth={1.75} aria-hidden />
                  </span>
                  <p className="text-xs leading-snug text-site-muted sm:text-[13px]">{text}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <div className="bg-site-deep text-slate-300">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-12">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            <div className="sm:col-span-2 lg:col-span-1">
              <Link href="/" className="inline-block" aria-label={`Главная — ${COMPANY.name}`}>
                <div className="relative h-14 w-14 sm:h-16 sm:w-16">
                  <Image
                    src={logoSrc}
                    alt={`${COMPANY.name} — логотип`}
                    width={64}
                    height={64}
                    unoptimized={logoSrc.startsWith("http://") || logoSrc.startsWith("https://")}
                    className="h-14 w-14 rounded-full object-contain sm:h-16 sm:w-16"
                  />
                </div>
              </Link>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-400">{main.brandTagline}</p>
              <ul className="mt-4 space-y-1.5 text-xs leading-relaxed text-slate-400 sm:text-sm">
                <li className="font-medium text-slate-200">{main.legalNameLine}</li>
                <li>БИН: {COMPANY.bankDetails.bin}</li>
                <li>ИИК {COMPANY.bankDetails.iik}</li>
                <li>{main.addressLine}</li>
                <li>{main.workHoursLine}</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">{main.catalogHeading}</h3>
              <ul className="mt-4 space-y-2">
                {main.catalogLinks.map(({ label, href }) => (
                  <li key={`${href}-${label}`}>
                    <Link
                      href={href}
                      className="group inline-flex items-start gap-1.5 text-sm text-slate-400 transition hover:text-white"
                    >
                      <ChevronRight
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500 group-hover:text-slate-300"
                        aria-hidden
                      />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">{main.companyHeading}</h3>
              <ul className="mt-4 space-y-2">
                {main.companyLinks.map(({ label, href }) => (
                  <li key={`${href}-${label}`}>
                    <Link
                      href={href}
                      className="group inline-flex items-start gap-1.5 text-sm text-slate-400 transition hover:text-white"
                    >
                      <ChevronRight
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500 group-hover:text-slate-300"
                        aria-hidden
                      />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">{main.contactHeading}</h3>
              <ul className="mt-4 space-y-3 text-sm">
                <li className="flex gap-2.5">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden />
                  <a
                    href={COMPANY_PHONE_HREF}
                    className="break-all text-slate-300 underline decoration-slate-600 underline-offset-2 transition hover:text-white"
                  >
                    {COMPANY.phoneDisplay}
                  </a>
                </li>
                <li className="flex gap-2.5">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden />
                  <a
                    href={COMPANY_EMAIL_HREF}
                    className="break-all text-slate-300 underline decoration-slate-600 underline-offset-2 transition hover:text-white"
                  >
                    {COMPANY.email}
                  </a>
                </li>
                <li className="flex gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden />
                  <span className="text-slate-400">{main.addressLine}</span>
                </li>
              </ul>
              <a
                href={waContactUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-site-whatsapp px-4 py-3 text-sm font-semibold text-white transition hover:bg-site-whatsapp-hover sm:w-auto sm:min-w-[200px]"
              >
                <WhatsappIcon className="h-5 w-5 text-white" />
                {main.whatsappButtonLabel}
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-center text-xs text-slate-500 sm:px-6 sm:text-sm lg:flex-row lg:flex-wrap lg:items-center lg:justify-between lg:gap-x-4 lg:text-left">
            <p className="order-1 lg:order-none">{copyright}</p>
            <p className="order-2 text-slate-500 lg:order-none lg:flex-1 lg:text-center">{main.bottomTagline}</p>
            <div className="order-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 lg:order-none lg:justify-end">
              <Link href="/terms" className="transition hover:text-slate-300">
                {main.termsLabel}
              </Link>
              <span className="text-slate-600" aria-hidden>
                |
              </span>
              <Link href="/privacy" className="transition hover:text-slate-300">
                {main.privacyLabel}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
