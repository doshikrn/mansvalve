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
  return (
    <div className="border-b border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-7 lg:px-10">
        <div className="grid min-h-[96px] grid-cols-1 items-center gap-5 py-6 lg:min-h-[112px] lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:gap-8 lg:py-7 xl:min-h-[120px] xl:gap-10">
          <div className="flex items-center justify-between gap-4 lg:block lg:justify-self-start">
            <Link
              href="/"
              className="relative flex shrink-0 items-center"
              aria-label={`${COMPANY.name} — на главную`}
            >
              <span className="relative block h-[104px] w-[104px] shrink-0 overflow-hidden rounded-2xl bg-white p-2 shadow-md ring-2 ring-slate-200/85 sm:h-[118px] sm:w-[118px] xl:h-[128px] xl:w-[128px] xl:p-2.5">
                <Image
                  src={HEADER_LOGO_SRC}
                  alt={`${COMPANY.name} — логотип`}
                  width={512}
                  height={512}
                  priority
                  quality={100}
                  sizes="(max-width: 1280px) 128px, 140px"
                  unoptimized
                  className="h-full w-full object-contain object-center"
                />
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

          <div className="hidden min-w-0 justify-center justify-self-stretch lg:flex lg:px-3 xl:px-5">
            <div
              className={cn(
                "flex w-full max-w-[640px] flex-1 justify-center",
                "[&>div]:!max-w-[min(100%,640px)]",
                "[&_form>div.flex]:!h-14 [&_form>div.flex]:!min-h-[52px]",
                "[&_button[type=submit]]:!min-w-[7.25rem] [&_button[type=submit]]:!px-4 [&_button[type=submit]]:!text-base [&_button[type=submit]]:!font-bold",
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

          <div className="hidden shrink-0 flex-col gap-3.5 lg:flex xl:flex-row xl:items-stretch xl:gap-4">
            <div className="flex max-w-[300px] min-w-[232px] flex-col gap-3 rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white via-slate-50/40 to-white p-4 shadow-sm ring-1 ring-slate-900/[0.05]">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">
                  Отдел продаж
                </p>
                <CopyToClipboard
                  variant="minimal"
                  value={COMPANY.phoneE164}
                  messageForCopyToast={COMPANY.phoneDisplay}
                  kind="phone"
                  title="Скопировать номер отдела продаж"
                  className="mt-2 inline-flex w-full max-w-full text-left"
                >
                  <span className="inline-flex items-center gap-2.5 text-lg font-bold tabular-nums tracking-tight text-[#0c2342] xl:text-xl">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0c2342]/10 text-[#0c2342]">
                      <Phone className="h-5 w-5" aria-hidden strokeWidth={2} />
                    </span>
                    {COMPANY.phoneDisplay}
                  </span>
                </CopyToClipboard>
              </div>
              <div className="border-t border-slate-200/90 pt-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Для заявок</p>
                <div className="mt-1.5 flex items-start gap-2.5">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden strokeWidth={2} />
                  <CopyToClipboard
                    variant="minimal"
                    value={COMPANY.email}
                    messageForCopyToast={COMPANY.email}
                    kind="email"
                    title={COMPANY.email}
                    className="!inline-block max-w-full text-left text-sm font-semibold leading-snug text-slate-800 hover:text-[#0c2342]"
                  >
                    {COMPANY.email}
                  </CopyToClipboard>
                </div>
              </div>
            </div>

            <Link
              href="/delivery"
              className="group flex max-w-[240px] min-w-[188px] flex-col justify-center gap-1 rounded-2xl border border-[#0c2342]/20 bg-gradient-to-br from-[#0c2342]/[0.06] via-white to-white px-4 py-3.5 shadow-sm ring-1 ring-[#0c2342]/10 transition hover:border-[#0c2342]/35 hover:shadow-md"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0c2342] text-white shadow-sm transition group-hover:bg-[#152d52]">
                  <Truck className="h-5 w-5" aria-hidden strokeWidth={2} />
                </span>
                <span className="min-w-0">
                  <span className="block text-base font-bold leading-tight text-[#0c2342]">Доставка</span>
                  <span className="mt-0.5 block text-xs leading-snug text-slate-600">
                    По РК и под заказ
                  </span>
                </span>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
