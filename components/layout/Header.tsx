"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Menu, Search, X } from "lucide-react";
import { COMPANY, COMPANY_WHATSAPP_BASE_URL } from "@/lib/company";
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
  return <span className="shrink-0 text-slate-300" aria-hidden="true">|</span>;
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
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Mobile: search + logo + menu */}
        <div className="flex items-center justify-between gap-2 py-3 md:hidden">
          <Link
            href="/"
            className="block min-w-0 max-w-[calc(100%-5.5rem)]"
            aria-label={`Главная — ${COMPANY.name}`}
          >
            <div className="relative h-12 w-[200px] sm:w-[220px]">
              <Image
                src="/images/logo-mansvalve-light.png"
                alt={`${COMPANY.name} logo`}
                fill
                priority
                sizes="(max-width: 640px) 200px, 220px"
                className="object-contain object-left"
              />
            </div>
          </Link>
          <div className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300"
              onClick={() => {
                setMobileSearchOpen(true);
                setMobileOpen(false);
              }}
              aria-label="Поиск по каталогу"
            >
              <Search className="h-5 w-5" />
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
            <div
              className="w-full max-w-lg"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <CatalogSearchPanel
                isOpen
                onClose={() => setMobileSearchOpen(false)}
                mode="fullscreen"
                onSearchSubmit={goToCatalogQuery}
              />
            </div>
          </div>
        )}

        {/* Desktop: two rows — contacts, then logo + nav + search */}
        <div className="hidden md:block">
          <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1.5 border-b border-slate-100 py-2 text-xs sm:text-sm">
            <div className="inline-flex min-w-0 max-w-full items-baseline gap-1.5 whitespace-nowrap text-slate-800">
              <span className="shrink-0 text-slate-500">Тел.:</span>
              <CopyToClipboard
                variant="minimal"
                value={COMPANY.phoneE164}
                messageForCopyToast={COMPANY.phoneDisplay}
                kind="phone"
                className="text-sm font-semibold"
              >
                {COMPANY.phoneDisplay}
              </CopyToClipboard>
            </div>
            <Sep />
            <div className="inline-flex min-w-0 max-w-[min(100%,18rem)] items-baseline gap-1.5 whitespace-nowrap text-slate-800 lg:max-w-[20rem] xl:max-w-[24rem]">
              <span className="shrink-0 text-slate-500">E-mail:</span>
              <CopyToClipboard
                variant="minimal"
                value={COMPANY.email}
                messageForCopyToast={COMPANY.email}
                kind="email"
                className="min-w-0 text-sm font-medium"
                title={COMPANY.email}
              >
                <span className="min-w-0 max-w-full truncate" title={COMPANY.email}>
                  {COMPANY.email}
                </span>
              </CopyToClipboard>
            </div>
            <Sep />
            <a
              href={COMPANY_WHATSAPP_BASE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-green-500 px-2.5 py-1 text-xs font-semibold text-white hover:bg-green-600"
            >
              <WhatsappIcon className="h-3.5 w-3.5" />
              WhatsApp
            </a>
          </div>

          <div className="grid min-h-14 grid-cols-1 items-center gap-3 py-2.5 lg:grid-cols-[auto_1fr_auto] lg:gap-4">
            <div className="flex min-w-0 justify-center lg:justify-start">
              <Link href="/" className="block" aria-label={`Главная — ${COMPANY.name}`}>
                <div className="relative mx-auto h-12 w-[192px] lg:mx-0 lg:h-14 lg:w-[220px]">
                  <Image
                    src="/images/logo-mansvalve-light.png"
                    alt={`${COMPANY.name} logo`}
                    fill
                    priority
                    sizes="(max-width: 1280px) 220px, 240px"
                    className="object-contain object-left"
                  />
                </div>
              </Link>
            </div>

            <nav
              className="mx-auto flex max-w-full min-w-0 flex-nowrap justify-center gap-x-2 overflow-x-auto text-sm font-medium text-slate-600 [scrollbar-width:none] sm:gap-x-3 md:gap-x-2 lg:gap-x-4 [&::-webkit-scrollbar]:hidden"
              aria-label="Основная навигация"
            >
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="shrink-0 whitespace-nowrap transition-colors hover:text-blue-700"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div
              className="relative z-20 flex w-full min-w-0 items-center justify-center lg:justify-end"
              ref={searchWrapRef}
            >
              <button
                type="button"
                className={cn(
                  "inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition",
                  "hover:border-blue-300 hover:text-blue-700",
                  "focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:outline-none",
                  searchOpen && "border-blue-400 text-blue-700",
                )}
                onClick={() => setSearchOpen((o) => !o)}
                aria-label="Поиск по каталогу"
                aria-expanded={searchOpen}
                id="header-search-trigger"
              >
                <Search className="h-5 w-5" />
              </button>
              {searchOpen && (
                <div className="absolute right-0 top-full z-50 mt-1.5">
                  <CatalogSearchPanel
                    isOpen
                    onClose={() => setSearchOpen(false)}
                    mode="dropdown"
                    onSearchSubmit={goToCatalogQuery}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <nav className="mx-auto max-w-7xl space-y-1 px-4 py-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-md px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-blue-700"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 border-t border-slate-200 pt-2">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  setMobileSearchOpen(true);
                }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <Search className="h-4 w-4 text-slate-500" />
                Поиск по каталогу
              </button>
            </div>
            <div className="mt-2 flex flex-col gap-2 border-t border-slate-200 pt-3 text-sm text-slate-800">
              <div className="px-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Телефон</p>
                <div className="mt-1">
                  <CopyToClipboard
                    variant="minimal"
                    value={COMPANY.phoneE164}
                    messageForCopyToast={COMPANY.phoneDisplay}
                    kind="phone"
                    className="font-medium"
                  >
                    {COMPANY.phoneDisplay}
                  </CopyToClipboard>
                </div>
              </div>
              <div className="px-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">E-mail</p>
                <div className="mt-1">
                  <CopyToClipboard
                    variant="minimal"
                    value={COMPANY.email}
                    messageForCopyToast={COMPANY.email}
                    kind="email"
                    className="min-w-0 font-medium"
                    title={COMPANY.email}
                  >
                    <span className="min-w-0 break-words" title={COMPANY.email}>
                      {COMPANY.email}
                    </span>
                  </CopyToClipboard>
                </div>
              </div>
              <a
                href={COMPANY_WHATSAPP_BASE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 flex items-center justify-center gap-1.5 rounded-full bg-green-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-600"
              >
                <WhatsappIcon className="h-4 w-4" />
                Написать в WhatsApp
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
