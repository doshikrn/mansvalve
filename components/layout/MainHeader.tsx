"use client";

import Image from "next/image";
import Link from "next/link";
import { Mail, Menu, Search, Truck, X } from "lucide-react";
import { CatalogSearchPanel } from "@/components/search/CatalogSearchPanel";
import { CopyToClipboard } from "@/components/contacts/CopyToClipboard";
import { HEADER_LOGO_SRC } from "@/components/layout/header-logo";
import { COMPANY } from "@/lib/company";

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
        <div className="grid min-h-[88px] grid-cols-1 items-center gap-5 py-6 lg:min-h-[96px] lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:gap-8 lg:py-7 xl:min-h-[104px] xl:gap-10">
          <div className="flex items-center justify-between gap-4 lg:block lg:justify-self-start">
            <Link
              href="/"
              className="relative flex shrink-0 items-center"
              aria-label={`${COMPANY.name} — на главную`}
            >
              <span className="relative block h-[72px] w-[72px] shrink-0 overflow-hidden rounded-full bg-white p-1.5 ring-2 ring-slate-200/90 shadow-sm sm:h-[80px] sm:w-[80px] xl:h-[88px] xl:w-[88px]">
                <Image
                  src={HEADER_LOGO_SRC}
                  alt={`${COMPANY.name} — логотип`}
                  width={512}
                  height={512}
                  priority
                  quality={100}
                  sizes="(max-width: 1024px) 88px, 96px"
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

          <div className="hidden min-w-0 justify-center justify-self-stretch lg:flex lg:px-4 xl:px-6">
            <div className="flex w-full max-w-[560px] flex-1 justify-center">
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

          <div className="hidden shrink-0 flex-col gap-3 lg:flex xl:flex-row xl:items-stretch xl:gap-4">
            <div className="group flex max-w-[260px] min-w-[210px] items-start gap-3 rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white px-4 py-3.5 shadow-sm ring-1 ring-slate-900/5 transition hover:border-blue-600/35 hover:shadow-md">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600/10 text-blue-700 transition group-hover:bg-blue-600/15">
                <Mail className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0 text-left">
                <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Для заявок
                </span>
                <div className="mt-0.5">
                  <CopyToClipboard
                    variant="minimal"
                    value={COMPANY.email}
                    messageForCopyToast={COMPANY.email}
                    kind="email"
                    title={COMPANY.email}
                    className="!inline-block max-w-full truncate text-left text-sm font-semibold text-slate-900 hover:text-blue-800"
                  >
                    {COMPANY.email}
                  </CopyToClipboard>
                </div>
              </div>
            </div>

            <Link
              href="/delivery"
              className="flex max-w-[220px] min-w-[180px] items-center gap-3 rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white px-4 py-3.5 shadow-sm ring-1 ring-slate-900/5 transition hover:border-blue-600/35 hover:shadow-md"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-800/10 text-slate-800">
                <Truck className="h-5 w-5" aria-hidden />
              </span>
              <span className="text-base font-semibold leading-snug text-slate-900">Доставка</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
