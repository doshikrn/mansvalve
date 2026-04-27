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
  { label: "О компании", href: "/about" },
  { label: "Сертификаты", href: "/certificates" },
  { label: "Доставка", href: "/delivery" },
  { label: "Контакты", href: "/contacts" },
] as const;

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
      <div className="mx-auto max-w-7xl px-3 sm:px-6">
        <div className="flex h-14 items-center justify-between gap-2 sm:h-[4.5rem]">
          <Link
            href="/"
            className="shrink-0 p-0"
            aria-label={`Главная — ${COMPANY.name}`}
          >
            <div className="relative h-11 w-[10.5rem] sm:h-12 sm:w-48 md:h-12 md:w-52">
              <Image
                src="/images/logo-mansvalve-light.png"
                alt={`${COMPANY.name} logo`}
                fill
                priority
                sizes="(max-width: 768px) 11rem, 14rem"
                className="object-contain object-left"
              />
            </div>
          </Link>

          <div
            className="hidden min-h-0 min-w-0 flex-1 items-center justify-end overflow-x-auto overflow-y-visible [scrollbar-width:thin] md:flex md:pl-2 [&::-webkit-scrollbar]:h-1.5"
          >
            <nav
              className="mr-2 flex shrink-0 items-center gap-x-2.5 pr-1 text-[12px] font-medium text-slate-600 lg:gap-x-3 lg:text-[13px]"
              aria-label="Основная навигация"
            >
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="shrink-0 whitespace-nowrap py-1.5 transition-colors hover:text-slate-900"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="mx-1.5 h-4 w-px shrink-0 bg-slate-200" aria-hidden="true" />

            <div className="mr-2 flex shrink-0 items-center gap-x-2.5">
              <CopyToClipboard
                variant="minimal"
                value={COMPANY.email}
                messageForCopyToast={COMPANY.email}
                kind="email"
                title={COMPANY.email}
                className="shrink-0 !text-slate-600 [max-width:min(11rem,22vw)] hover:!text-slate-800">
                <span className="whitespace-nowrap" title={COMPANY.email}>
                  {COMPANY.email}
                </span>
              </CopyToClipboard>
              <CopyToClipboard
                variant="minimal"
                value={COMPANY.phoneE164}
                messageForCopyToast={COMPANY.phoneDisplay}
                kind="phone"
                className="shrink-0 !text-slate-600 !tabular-nums hover:!text-slate-800"
              >
                {COMPANY.phoneDisplay}
              </CopyToClipboard>
            </div>

            <div className="ml-0.5 h-4 w-px shrink-0 bg-slate-200" aria-hidden="true" />

            <div
              className="relative z-20 flex min-w-0 shrink-0 items-center gap-1.5 pl-1.5"
              ref={searchWrapRef}
            >
              <div
                className={cn(
                  "w-full min-w-0 max-w-full transition-[max-width,opacity] duration-300 ease-out will-change-[max-width]",
                  searchOpen
                    ? "max-w-[min(100vw,300px)] overflow-visible opacity-100"
                    : "max-w-0 overflow-hidden opacity-0",
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
                  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors",
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
              className="ml-0.5 inline-flex h-9 min-w-0 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#25D366] px-2.5 text-xs font-medium text-white shadow-sm transition hover:bg-[#1ebe57] focus-visible:ring-2 focus-visible:ring-[#25D366]/40 focus-visible:ring-offset-2 lg:px-3 lg:text-sm"
            >
              <WhatsappIcon className="h-3.5 w-3.5 shrink-0" />
              <span>WhatsApp</span>
            </a>
          </div>

          <div className="flex shrink-0 items-center gap-0.5 md:hidden">
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

      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white md:hidden">
          <nav className="mx-auto max-w-7xl space-y-0.5 px-3 py-3 sm:px-0">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-md px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-1 border-t border-slate-100 pt-2 text-sm text-slate-600">
              <div className="px-1 py-1.5">
                <CopyToClipboard
                  variant="minimal"
                  value={COMPANY.email}
                  messageForCopyToast={COMPANY.email}
                  kind="email"
                >
                  <span className="whitespace-nowrap" title={COMPANY.email}>
                    {COMPANY.email}
                  </span>
                </CopyToClipboard>
              </div>
              <div className="px-1 py-1.5">
                <CopyToClipboard
                  variant="minimal"
                  value={COMPANY.phoneE164}
                  messageForCopyToast={COMPANY.phoneDisplay}
                  kind="phone"
                >
                  <span className="tabular-nums" title={COMPANY.phoneDisplay}>
                    {COMPANY.phoneDisplay}
                  </span>
                </CopyToClipboard>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                setMobileSearchOpen(true);
              }}
              className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <Search className="h-4 w-4 text-slate-500" strokeWidth={1.75} />
              Поиск по каталогу
            </button>
            <a
              href={COMPANY_WHATSAPP_BASE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#25D366] py-2.5 text-sm font-medium text-white transition hover:bg-[#1ebe57]"
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
