"use client";

import Image from "next/image";
import Link from "next/link";
import { Mail, Menu, Phone, Search, Truck, X } from "lucide-react";
import { CatalogSearchPanel } from "@/components/search/CatalogSearchPanel";
import { CopyToClipboard } from "@/components/contacts/CopyToClipboard";
import { HEADER_LOGO_SRC } from "@/components/layout/header-logo";
import { COMPANY } from "@/lib/company";
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
    <div className="border-b border-slate-200 bg-white shadow-[0_1px_4px_rgba(15,23,42,0.05)]">
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
              <span className="hidden min-w-0 flex-col justify-center leading-none lg:flex">
                <span className="font-bold uppercase tracking-[0.08em] text-[#0c2342] xl:text-[15px]">
                  {brandPrimary}
                </span>
                {brandSecondary ? (
                  <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600 xl:text-xs">
                    {brandSecondary}
                  </span>
                ) : null}
              </span>
            </Link>
            <div className="flex shrink-0 items-center gap-2 lg:hidden">
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm"
                onClick={onOpenMobileSearch}
                aria-label="Поиск по каталогу"
              >
                <Search className="h-5 w-5" strokeWidth={2} />
              </button>
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm"
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
                "[&_button[type=submit]]:!bg-[#0c2342] [&_button[type=submit]]:!text-white",
                "[&_button[type=submit]]:hover:!bg-[#152d52] [&_button[type=submit]]:shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]",
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
            <div className="flex max-w-[272px] min-w-[208px] flex-col gap-2 rounded-xl border border-slate-200/90 bg-gradient-to-br from-white via-slate-50/50 to-white px-3 py-2.5 ring-1 ring-slate-900/[0.04]">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-500">
                  Отдел продаж
                </p>
                <CopyToClipboard
                  variant="minimal"
                  value={COMPANY.phoneE164}
                  messageForCopyToast={COMPANY.phoneDisplay}
                  kind="phone"
                  title="Скопировать номер отдела продаж"
                  className="mt-1 inline-flex w-full max-w-full text-left"
                >
                  <span className="inline-flex items-center gap-2 text-[15px] font-bold tabular-nums tracking-tight text-[#0c2342]">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0c2342]/10 text-[#0c2342]">
                      <Phone className="h-4 w-4" aria-hidden strokeWidth={2} />
                    </span>
                    {COMPANY.phoneDisplay}
                  </span>
                </CopyToClipboard>
              </div>
              <div className="border-t border-slate-200/80 pt-2">
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Для заявок</p>
                <div className="mt-1 flex items-start gap-2">
                  <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden strokeWidth={2} />
                  <CopyToClipboard
                    variant="minimal"
                    value={COMPANY.email}
                    messageForCopyToast={COMPANY.email}
                    kind="email"
                    title={COMPANY.email}
                    className="!inline-block max-w-full text-left text-xs font-semibold leading-snug text-slate-800 hover:text-[#0c2342]"
                  >
                    {COMPANY.email}
                  </CopyToClipboard>
                </div>
              </div>
            </div>

            <Link
              href="/delivery"
              className="group flex max-w-[220px] min-w-[168px] flex-col justify-center rounded-xl border border-[#0c2342]/20 bg-gradient-to-br from-[#0c2342]/[0.05] via-white to-white px-3 py-2.5 ring-1 ring-[#0c2342]/10 transition hover:border-[#0c2342]/35 hover:shadow-sm"
            >
              <span className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0c2342] text-white transition group-hover:bg-[#152d52]">
                  <Truck className="h-4 w-4" aria-hidden strokeWidth={2} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold leading-tight text-[#0c2342]">Доставка</span>
                  <span className="mt-0.5 block text-[11px] leading-snug text-slate-600">По РК и под заказ</span>
                </span>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
