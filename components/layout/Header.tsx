"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Menu, Search, X } from "lucide-react";
import { COMPANY, COMPANY_PHONE_HREF, COMPANY_WHATSAPP_BASE_URL } from "@/lib/company";
import { WhatsappIcon } from "@/components/icons/WhatsappIcon";
import { CopyToClipboard } from "@/components/contacts/CopyToClipboard";
import { CatalogSearchPanel } from "@/components/search/CatalogSearchPanel";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Каталог", href: "/catalog" },
  { label: "Как работаем", href: "/#how-it-works" },
  { label: "FAQ", href: "/#faq" },
  { label: "Сертификаты", href: "/certificates" },
  { label: "Контакты", href: "/contacts" },
] as const;

function Sep() {
  return <span className="mx-0.5 shrink-0 text-gray-300" aria-hidden="true">|</span>;
}

function goToCatalogQuery(q: string) {
  window.location.href = `/catalog?q=${encodeURIComponent(q)}`;
}

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!searchOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen && !mobileSearchOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setMobileSearchOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [searchOpen, mobileSearchOpen]);

  useEffect(() => {
    if (!mobileSearchOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileSearchOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Mobile: search + logo + menu */}
        <div className="flex items-center justify-between gap-2 py-3 md:hidden">
          <Link
            href="/"
            className="block min-w-0 max-w-[calc(100%-5.5rem)] p-0"
            aria-label={`Главная — ${COMPANY.name}`}
          >
            <div className="relative h-14 w-[min(200px,46vw)]">
              <Image
                src="/images/logo-mansvalve-light.png"
                alt={`${COMPANY.name} logo`}
                fill
                priority
                sizes="(max-width: 640px) 46vw, 200px"
                className="object-contain object-left"
              />
            </div>
          </Link>
          <div className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100"
              onClick={() => {
                setMobileSearchOpen(true);
                setMobileOpen(false);
              }}
              aria-label="Поиск по каталогу"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg p-0 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              aria-label={mobileOpen ? "Закрыть меню" : "Открыть меню"}
              aria-expanded={mobileOpen}
              onClick={() => {
                setMobileOpen((v) => !v);
                setMobileSearchOpen(false);
              }}
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileSearchOpen && (
          <div
            className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-slate-900/50 p-3 pt-4 md:hidden"
            role="presentation"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setMobileSearchOpen(false);
            }}
          >
            <div className="w-full max-w-lg" onMouseDown={(e) => e.stopPropagation()}>
              <CatalogSearchPanel
                isOpen
                onClose={() => setMobileSearchOpen(false)}
                mode="fullscreen"
                onSearchSubmit={goToCatalogQuery}
              />
            </div>
          </div>
        )}

        {/* Desktop */}
        <div className="hidden md:block">
          <div className="flex min-h-8 items-center justify-center border-b border-slate-200/50 bg-slate-50/40 py-1.5 text-xs text-gray-500 sm:text-[13px]">
            <div className="flex min-w-0 max-w-full flex-wrap items-center justify-center gap-y-0.5">
              <span className="shrink-0 font-normal tabular-nums">{COMPANY.phoneDisplay}</span>
              <Sep />
              <CopyToClipboard
                variant="minimal"
                value={COMPANY.email}
                messageForCopyToast={COMPANY.email}
                kind="email"
                title={COMPANY.email}
                className="group min-w-0 max-w-[min(100%,14rem)] sm:max-w-md text-gray-500 hover:text-gray-600 [&_span]:border-gray-300 [&_span]:text-gray-500 group-hover:[&_span]:border-gray-400 group-hover:[&_span]:text-gray-600"
              >
                <span className="block min-w-0 max-w-full truncate" title={COMPANY.email}>
                  {COMPANY.email}
                </span>
              </CopyToClipboard>
            </div>
          </div>

          <div className="grid items-center gap-x-3 gap-y-3 py-3.5 [grid-template-columns:minmax(0,auto)_minmax(0,1fr)_minmax(0,auto)] lg:gap-x-5 lg:py-4">
            <div className="flex min-w-0 justify-center lg:justify-start">
              <Link href="/" className="block p-0" aria-label={`Главная — ${COMPANY.name}`}>
                <div className="relative h-[3.75rem] w-[14.5rem] sm:h-16 sm:w-60 lg:h-[3.5rem] lg:w-[16.25rem]">
                  <Image
                    src="/images/logo-mansvalve-light.png"
                    alt={`${COMPANY.name} logo`}
                    fill
                    priority
                    sizes="(max-width: 1280px) 16rem, 16.25rem"
                    className="object-contain object-left"
                  />
                </div>
              </Link>
            </div>

            <nav
              className="mx-auto flex max-w-full min-w-0 flex-nowrap justify-center gap-x-1 overflow-x-auto [scrollbar-width:none] lg:gap-x-3 xl:gap-x-6 [&::-webkit-scrollbar]:hidden"
              aria-label="Основная навигация"
            >
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="shrink-0 px-0.5 py-0.5 text-sm font-semibold text-slate-800 transition-all hover:text-blue-800/90 hover:underline decoration-slate-300/80 underline-offset-4"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex w-full min-w-0 max-w-full items-center justify-center gap-1.5 sm:gap-2 md:min-w-0 md:shrink-0 md:justify-end">
              <div
                className="relative z-20 flex min-w-0 max-w-full flex-1 items-center justify-end sm:min-w-[2rem]"
                ref={searchWrapRef}
              >
                <div
                  className={cn(
                    "w-full min-w-0 max-w-full overflow-hidden transition-[max-width,opacity] duration-300 ease-out will-change-[max-width]",
                    searchOpen ? "max-w-[min(100%,300px)] opacity-100" : "max-w-0 opacity-0",
                    !searchOpen && "pointer-events-none",
                  )}
                >
                  {searchOpen && (
                    <CatalogSearchPanel
                      isOpen
                      onClose={() => setSearchOpen(false)}
                      mode="dropdown"
                      onSearchSubmit={goToCatalogQuery}
                      headerEmbed
                    />
                  )}
                </div>
                <button
                  type="button"
                  className={cn(
                    "ml-auto inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-slate-200/80 bg-slate-50/60 px-3 text-sm text-slate-600 transition",
                    "hover:border-slate-300 hover:bg-slate-100/80 hover:text-slate-900",
                    "focus-visible:ring-2 focus-visible:ring-blue-500/25 focus-visible:outline-none",
                    searchOpen && "pointer-events-none invisible absolute w-0 overflow-hidden p-0 opacity-0",
                  )}
                  onClick={() => setSearchOpen(true)}
                  aria-label="Открыть поиск по каталогу"
                  aria-expanded={searchOpen}
                >
                  <Search className="h-4 w-4" />
                  <span className="whitespace-nowrap pr-0.5">Поиск</span>
                </button>
              </div>

              <a
                href={COMPANY_PHONE_HREF}
                className="inline-flex h-9 min-w-0 max-w-full shrink-0 items-center justify-center rounded-full border border-blue-200/80 bg-blue-50 px-2.5 text-xs font-semibold text-blue-900 shadow-sm transition hover:border-blue-300 hover:bg-blue-100 sm:px-3.5 sm:text-sm"
              >
                {COMPANY.phoneDisplay}
              </a>
              <a
                href={COMPANY_WHATSAPP_BASE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 min-w-0 max-w-full shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#25D366] px-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#1ebe57] hover:shadow active:scale-[0.99] sm:px-3"
              >
                <WhatsappIcon className="h-3.5 w-3.5 shrink-0" />
                <span className="whitespace-nowrap">WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="bg-white md:hidden">
          <nav className="mx-auto max-w-7xl space-y-0.5 px-4 py-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-md px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-blue-800"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  setMobileSearchOpen(true);
                }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <Search className="h-4 w-4 text-slate-500" />
                Поиск по каталогу
              </button>
            </div>
            <div className="mt-3 space-y-2 border-t border-slate-100 pt-3 text-sm text-slate-700">
              <a
                href={COMPANY_PHONE_HREF}
                className="flex w-full items-center justify-center gap-1.5 rounded-full border border-blue-200/80 bg-blue-50 py-2.5 text-sm font-semibold text-blue-900 transition hover:border-blue-300 hover:bg-blue-100"
              >
                {COMPANY.phoneDisplay}
              </a>
              <CopyToClipboard
                variant="minimal"
                value={COMPANY.email}
                messageForCopyToast={COMPANY.email}
                kind="email"
                title={COMPANY.email}
                className="w-full justify-center text-center text-slate-700"
              >
                <span className="break-words" title={COMPANY.email}>
                  {COMPANY.email}
                </span>
              </CopyToClipboard>
              <a
                href={COMPANY_WHATSAPP_BASE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#25D366] py-2.5 text-sm font-medium text-white transition hover:bg-[#1ebe57]"
              >
                <WhatsappIcon className="h-4 w-4" />
                WhatsApp
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
