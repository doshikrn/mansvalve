"use client";

import Image from "next/image";
import Link from "next/link";
import { Mail, Menu, Phone, Search, Truck, X } from "lucide-react";
import { CatalogSearchPanel } from "@/components/search/CatalogSearchPanel";
import { HEADER_LOGO_SRC } from "@/components/layout/header-logo";
import { COMPANY, COMPANY_EMAIL_HREF, COMPANY_PHONE_HREF } from "@/lib/company";
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
    <div className="border-b border-site-border bg-site-card shadow-[0_1px_4px_rgba(15,27,45,0.05)]">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-7 lg:px-10">
        <div className="grid min-h-[72px] grid-cols-1 items-center gap-3 py-3.5 lg:min-h-[76px] lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:gap-5 lg:py-3 xl:min-h-[80px] xl:gap-6">
          <div className="flex items-center justify-between gap-3 lg:block lg:justify-self-start">
            <Link
              href="/"
              className="flex min-w-0 shrink-0 items-center gap-2.5 sm:gap-3 lg:min-w-[180px] lg:max-w-[220px] lg:gap-3"
              aria-label={`${COMPANY.name} — на главную`}
            >
              <span className="relative block h-12 w-12 shrink-0 overflow-hidden sm:h-14 sm:w-14 lg:h-[72px] lg:w-[72px] xl:h-[84px] xl:w-[84px]">
                <Image
                  src={HEADER_LOGO_SRC}
                  alt={`${COMPANY.name} — логотип`}
                  width={512}
                  height={512}
                  priority
                  quality={100}
                  sizes="(max-width: 1023px) 56px, 84px"
                  unoptimized
                  className="h-full w-full object-contain object-center"
                />
              </span>
              <span className="min-w-0 flex flex-col justify-center leading-none lg:flex">
                <span className="truncate text-[12px] font-bold uppercase tracking-[0.08em] text-site-primary sm:text-[13px] xl:text-[15px]">
                  {brandPrimary}
                </span>
                {brandSecondary ? (
                  <span className="mt-0.5 truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-site-muted sm:text-[11px] xl:text-xs">
                    {brandSecondary}
                  </span>
                ) : null}
              </span>
            </Link>
            <div className="flex shrink-0 items-center gap-2 lg:hidden">
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-site-border bg-site-card text-site-muted shadow-sm"
                onClick={onOpenMobileSearch}
                aria-label="Поиск по каталогу"
              >
                <Search className="h-5 w-5" strokeWidth={2} />
              </button>
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-site-border bg-site-card text-site-muted shadow-sm"
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
                "flex w-full max-w-[640px] flex-1 justify-center",
                "[&>div]:!max-w-[min(100%,640px)]",
                "[&_form>div.flex]:!h-[50px] [&_form>div.flex]:!min-h-[48px] [&_form>div.flex]:!max-h-[52px]",
                "[&_label]:!pl-9 lg:[&_label]:!pl-10",
                "[&_button[type=submit]]:!min-w-[6.5rem] [&_button[type=submit]]:!px-3 [&_button[type=submit]]:!py-0 [&_button[type=submit]]:!text-sm [&_button[type=submit]]:!font-bold",
                "[&_button[type=submit]]:!bg-site-primary [&_button[type=submit]]:!text-white",
                "[&_button[type=submit]]:hover:!bg-site-primary-hover [&_button[type=submit]]:shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]",
              )}
            >
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

          <div className="hidden shrink-0 flex-col gap-2 lg:flex xl:flex-row xl:items-stretch xl:gap-3">
            <div className="flex max-w-[272px] min-w-[208px] flex-col gap-2 rounded-lg border border-site-border bg-site-card px-3 py-2.5 ring-1 ring-site-deep/[0.04]">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-site-muted">
                  Отдел продаж
                </p>
                <a
                  href={COMPANY_PHONE_HREF}
                  className="mt-1 inline-flex max-w-full items-center gap-2 rounded-md text-[15px] font-bold tabular-nums tracking-tight text-site-primary no-underline outline-none transition-colors hover:text-site-primary-hover focus-visible:ring-2 focus-visible:ring-site-primary/35 focus-visible:ring-offset-2"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-site-primary/10 text-site-primary">
                    <Phone className="h-4 w-4" aria-hidden strokeWidth={2} />
                  </span>
                  <span className="underline-offset-[3px] decoration-site-primary no-underline hover:underline">
                    {COMPANY.phoneDisplay}
                  </span>
                </a>
              </div>
              <div className="border-t border-slate-200/80 pt-2">
                <p className="text-[10px] font-medium uppercase tracking-wide text-site-muted">Для заявок</p>
                <a
                  href={COMPANY_EMAIL_HREF}
                  className="mt-1 flex min-w-0 items-start gap-2 rounded-md text-left text-xs font-semibold leading-snug text-site-ink no-underline outline-none transition-colors hover:text-site-primary focus-visible:ring-2 focus-visible:ring-site-primary/35 focus-visible:ring-offset-2"
                >
                  <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-site-muted" aria-hidden strokeWidth={2} />
                  <span className="min-w-0 break-all underline-offset-[3px] decoration-site-primary no-underline hover:underline">
                    {COMPANY.email}
                  </span>
                </a>
              </div>
            </div>

            <Link
              href="/delivery"
              className="group flex max-w-[220px] min-w-[168px] flex-col justify-center rounded-lg border border-site-primary/20 bg-site-card px-3 py-2.5 ring-1 ring-site-primary/10 transition hover:border-site-primary/35 hover:shadow-sm"
            >
              <span className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-site-primary text-white transition group-hover:bg-site-primary-hover">
                  <Truck className="h-4 w-4" aria-hidden strokeWidth={2} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold leading-tight text-site-primary">Доставка</span>
                  <span className="mt-0.5 block text-[11px] leading-snug text-site-muted">По РК и под заказ</span>
                </span>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
