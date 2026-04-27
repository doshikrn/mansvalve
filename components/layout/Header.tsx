"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Menu, Search, X } from "lucide-react";
import { COMPANY, COMPANY_WHATSAPP_BASE_URL } from "@/lib/company";
import { WhatsappIcon } from "@/components/icons/WhatsappIcon";
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
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Mobile: search + logo + menu */}
        <div className="flex items-center justify-between gap-3 py-3 md:hidden">
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
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100/90 hover:text-slate-800"
              onClick={() => {
                setMobileSearchOpen(true);
                setMobileOpen(false);
              }}
              aria-label="Поиск по каталогу"
            >
              <Search className="h-5 w-5" strokeWidth={1.75} />
            </button>
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-md p-0 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
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
          <div className="flex min-h-8 items-center justify-center border-b border-slate-200/50 bg-slate-50/50 py-1.5 text-xs text-gray-500 sm:text-[13px]">
            <div className="flex min-w-0 max-w-full flex-wrap items-center justify-center gap-y-0.5">
              <span className="shrink-0 font-normal tabular-nums" title={COMPANY.phoneDisplay}>
                {COMPANY.phoneDisplay}
              </span>
              <Sep />
              <span className="min-w-0 max-w-[min(100%,16rem)] truncate sm:max-w-md" title={COMPANY.email}>
                {COMPANY.email}
              </span>
            </div>
          </div>

          <div className="grid items-center gap-x-4 gap-y-2 py-3.5 [grid-template-columns:minmax(0,auto)_1fr_minmax(0,auto)] lg:gap-x-6 lg:gap-y-0 lg:py-4">
            <div className="flex min-w-0 items-center justify-start pr-1">
              <Link href="/" className="block p-0" aria-label={`Главная — ${COMPANY.name}`}>
                <div className="relative h-[3.5rem] w-56 shrink-0 lg:h-[3.5rem] lg:w-[16rem]">
                  <Image
                    src="/images/logo-mansvalve-light.png"
                    alt={`${COMPANY.name} logo`}
                    fill
                    priority
                    sizes="(max-width: 1280px) 16rem, 16rem"
                    className="object-contain object-left"
                  />
                </div>
              </Link>
            </div>

            <nav
              className="flex min-w-0 flex-1 flex-nowrap items-center justify-center justify-self-center overflow-x-auto [scrollbar-width:none] gap-x-2.5 sm:gap-x-4 md:px-1 lg:gap-x-5 xl:gap-x-6 [&::-webkit-scrollbar]:hidden"
              aria-label="Основная навигация"
            >
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="shrink-0 py-0.5 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex min-w-0 shrink-0 items-center justify-end gap-3.5 pl-1 lg:gap-4" ref={searchWrapRef}>
              <div
                className="relative z-20 flex min-w-0 items-center justify-end"
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
                    "ml-auto inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors",
                    "hover:bg-slate-100 hover:text-slate-800",
                    "focus-visible:ring-2 focus-visible:ring-slate-400/40 focus-visible:ring-offset-2 focus-visible:outline-none",
                    searchOpen && "pointer-events-none absolute w-0 overflow-hidden p-0 opacity-0",
                  )}
                  onClick={() => setSearchOpen(true)}
                  aria-label="Поиск по каталогу"
                  aria-expanded={searchOpen}
                >
                  <Search className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                </button>
              </div>

              <a
                href={COMPANY_WHATSAPP_BASE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 min-w-0 items-center justify-center gap-1.5 rounded-lg bg-[#25D366] px-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#1ebe57] focus-visible:ring-2 focus-visible:ring-[#25D366]/40 focus-visible:ring-offset-2"
              >
                <WhatsappIcon className="h-3.5 w-3.5 shrink-0" />
                <span>WhatsApp</span>
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
                className="block rounded-md px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
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
                className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                <Search className="h-4 w-4 text-slate-500" strokeWidth={1.75} />
                Поиск по каталогу
              </button>
            </div>
            <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-3 text-sm text-gray-500">
              <p className="px-0.5 tabular-nums" title={COMPANY.phoneDisplay}>
                {COMPANY.phoneDisplay}
              </p>
              <p className="break-words px-0.5" title={COMPANY.email}>
                {COMPANY.email}
              </p>
            </div>
            <a
              href={COMPANY_WHATSAPP_BASE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#25D366] py-2.5 text-sm font-medium text-white transition hover:bg-[#1ebe57]"
            >
              <WhatsappIcon className="h-4 w-4" />
              WhatsApp
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
