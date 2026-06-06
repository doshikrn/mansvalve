"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Copy, FileText, LayoutGrid, Mail, Menu, Phone, Search, X } from "lucide-react";
import { CatalogSearchPanel } from "@/components/search/CatalogSearchPanel";
import { CopyToClipboard } from "@/components/contacts/CopyToClipboard";
import { HEADER_LOGO_SRC } from "@/components/layout/header-logo";
import {
  COMPANY,
  COMPANY_EMAIL_HREF,
  COMPANY_PHONE_HREF,
  COMPANY_WHATSAPP_BASE_URL,
} from "@/lib/company";
import { cn } from "@/lib/utils";

type MainHeaderProps = {
  onSearchSubmit: (q: string) => void;
  onOpenMobileSearch: () => void;
  onToggleMobileNav: () => void;
  mobileNavOpen: boolean;
};

export function MainHeader({
  onSearchSubmit,
  onOpenMobileSearch,
  onToggleMobileNav,
  mobileNavOpen,
}: MainHeaderProps) {
  const brandParts = COMPANY.name.trim().split(/\s+/);
  const brandPrimary = brandParts[0] ?? COMPANY.name;
  const brandSecondary = brandParts.slice(1).join(" ");

  return (
    <div className="border-b border-white/[0.08] bg-[linear-gradient(180deg,var(--color-site-header-main)_0%,#0a1220_100%)] shadow-[0_14px_34px_-28px_rgba(0,0,0,0.85)]">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-7 lg:px-10">
        <div className="grid min-h-[74px] grid-cols-1 items-center gap-3 py-3.5 lg:min-h-[80px] lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:gap-5 lg:py-3 xl:gap-6">
          <div className="flex items-center justify-between gap-3 lg:block lg:justify-self-start">
            <Link
              href="/"
              className="hidden min-w-0 shrink-0 items-center gap-2.5 sm:flex sm:gap-3 lg:min-w-[188px] lg:max-w-[232px] lg:gap-3.5"
              aria-label={`${COMPANY.name} — на главную`}
            >
              <span className="relative block h-12 w-12 shrink-0 overflow-hidden rounded-full bg-white shadow-sm ring-1 ring-white/20 sm:h-14 sm:w-14 lg:h-[4.25rem] lg:w-[4.25rem] xl:h-[4.5rem] xl:w-[4.5rem]">
                <Image
                  src={HEADER_LOGO_SRC}
                  alt={`${COMPANY.name} — логотип`}
                  width={512}
                  height={512}
                  quality={85}
                  sizes="(max-width: 1023px) 56px, 64px"
                  className="h-full w-full object-contain object-center"
                />
              </span>
              <span className="min-w-0 flex flex-col justify-center leading-none lg:flex">
                <span className="truncate text-[12px] font-bold uppercase tracking-[0.08em] text-white sm:text-[13px] lg:text-[14px] xl:text-[15px]">
                  {brandPrimary}
                </span>
                {brandSecondary ? (
                  <span className="mt-0.5 truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400 sm:text-[11px] xl:text-xs">
                    {brandSecondary}
                  </span>
                ) : null}
              </span>
            </Link>
            <div className="flex shrink-0 items-center gap-2 lg:hidden">
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-white/12 bg-white/[0.07] text-slate-100 shadow-sm"
                onClick={onOpenMobileSearch}
                aria-label="Поиск по каталогу"
              >
                <Search className="h-5 w-5" strokeWidth={2} />
              </button>
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-white/12 bg-white/[0.07] text-slate-100 shadow-sm"
                onClick={onToggleMobileNav}
                aria-label={mobileNavOpen ? "Закрыть меню" : "Открыть меню"}
                aria-expanded={mobileNavOpen}
              >
                {mobileNavOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          <div className="hidden min-w-0 justify-center justify-self-stretch lg:flex lg:px-2 xl:px-4">
            <div
              className={cn(
                "flex w-full max-w-[720px] flex-1 items-center justify-center gap-3",
                "[&>div]:!max-w-[min(100%,560px)]",
                "[&_form>div.flex]:!h-[50px] [&_form>div.flex]:!min-h-[48px] [&_form>div.flex]:!max-h-[52px]",
                "[&_label]:!pl-9 lg:[&_label]:!pl-10",
                "[&_button[type=submit]]:!min-w-[6.5rem] [&_button[type=submit]]:!px-3 [&_button[type=submit]]:!py-0 [&_button[type=submit]]:!text-sm [&_button[type=submit]]:!font-bold",
                "[&_button[type=submit]]:!bg-site-primary [&_button[type=submit]]:!text-white",
                "[&_button[type=submit]]:hover:!bg-site-primary-hover [&_button[type=submit]]:shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]",
              )}
            >
              <Link
                href="/catalog"
                className="inline-flex h-[50px] shrink-0 items-center justify-center gap-2 rounded-lg bg-site-primary px-5 text-sm font-bold text-white shadow-[0_18px_34px_-24px_rgba(47,107,255,0.9)] ring-1 ring-white/12 transition hover:bg-site-primary-hover"
              >
                <LayoutGrid className="h-[17px] w-[17px]" aria-hidden strokeWidth={2} />
                Каталог
              </Link>
              <CatalogSearchPanel
                variant="headerBar"
                isOpen
                onClose={() => undefined}
                onSearchSubmit={onSearchSubmit}
                inputId="header-search-q"
                analyticsSource="header-bar"
              />
            </div>
          </div>

          <div className="hidden shrink-0 flex-col gap-2 lg:flex xl:flex-row xl:flex-wrap xl:items-stretch xl:justify-end xl:gap-3">
            <div className="site-industrial-panel flex max-w-[272px] min-w-[208px] flex-col gap-2 rounded-lg px-3 py-2.5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-400">
                  Отдел продаж
                </p>
                <a
                  href={COMPANY_PHONE_HREF}
                  className="mt-1 inline-flex max-w-full items-center gap-2 rounded-md text-[15px] font-bold tabular-nums tracking-tight text-white no-underline outline-none transition-colors hover:text-site-soft-blue focus-visible:ring-2 focus-visible:ring-site-primary/35 focus-visible:ring-offset-2"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-site-primary/15 text-site-soft-blue ring-1 ring-white/10">
                    <Phone className="h-4 w-4" aria-hidden strokeWidth={2} />
                  </span>
                  <span className="underline-offset-[3px] decoration-site-soft-blue no-underline hover:underline">
                    {COMPANY.phoneDisplay}
                  </span>
                </a>
              </div>
              <div className="border-t border-white/10 pt-2">
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Для заявок</p>
                <div className="mt-1 flex min-w-0 items-start gap-1.5">
                  <a
                    href={COMPANY_EMAIL_HREF}
                    className="flex min-w-0 items-start gap-2 rounded-md text-left text-xs font-semibold leading-snug text-slate-200 no-underline outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-site-primary/35 focus-visible:ring-offset-2"
                  >
                    <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden strokeWidth={2} />
                    <span className="min-w-0 break-all underline-offset-[3px] decoration-site-soft-blue no-underline hover:underline">
                      {COMPANY.email}
                    </span>
                  </a>
                  <CopyToClipboard
                    value={COMPANY.email}
                    messageForCopyToast={COMPANY.email}
                    kind="email"
                    variant="minimal"
                    aria-label="Скопировать e-mail"
                    title="Скопировать e-mail"
                    className="mt-0.5 shrink-0 text-slate-500 hover:text-site-soft-blue"
                  >
                    <Copy className="h-3.5 w-3.5" aria-hidden />
                  </CopyToClipboard>
                </div>
              </div>
            </div>

            <a
              href={COMPANY_WHATSAPP_BASE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="site-header-cta group flex max-w-[236px] min-w-[184px] flex-col justify-center rounded-lg px-4 py-2.5 ring-1 ring-white/10"
            >
              <span className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/14 text-white ring-1 ring-white/16 transition group-hover:bg-white/18">
                  <FileText className="h-4 w-4" aria-hidden strokeWidth={2} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold leading-tight">Получить КП</span>
                  <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-semibold leading-snug text-white/82">
                    за 15 минут
                    <ArrowRight className="h-3 w-3" aria-hidden />
                  </span>
                </span>
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
