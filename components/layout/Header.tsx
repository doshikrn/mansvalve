"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Menu, Search, X } from "lucide-react";
import { COMPANY, COMPANY_WHATSAPP_BASE_URL } from "@/lib/company";
import { WhatsappIcon } from "@/components/icons/WhatsappIcon";
import { CopyToClipboard } from "@/components/contacts/CopyToClipboard";
import { getPageAnalyticsContext, trackEvent } from "@/lib/analytics";
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

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [desktopSearch, setDesktopSearch] = useState("");
  const [mobileSearch, setMobileSearch] = useState("");
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  function handleSearchSubmit(
    e: FormEvent<HTMLFormElement>,
    value: string,
    onDone?: () => void,
  ) {
    e.preventDefault();
    const query = value.trim();
    if (!query) return;
    const pageContext = getPageAnalyticsContext(window.location.pathname);
    trackEvent("catalog_search", {
      source: "header-search",
      category: pageContext.category,
      product_slug: pageContext.product_slug,
      query,
    });
    onDone?.();
    window.location.href = `/catalog?q=${encodeURIComponent(query)}`;
  }

  useEffect(() => {
    if (!searchOpen) return;
    const t = window.setTimeout(() => searchInputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [searchOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Mobile: logo + menu */}
        <div className="flex items-center justify-between gap-2 py-3 md:hidden">
          <Link href="/" className="block min-w-0 shrink" aria-label={`Главная — ${COMPANY.name}`}>
            <div className="relative h-14 w-[210px] sm:w-[240px]">
              <Image
                src="/images/logo-mansvalve-light.png"
                alt={`${COMPANY.name} logo`}
                fill
                priority
                sizes="(max-width: 640px) 210px, 240px"
                className="object-contain object-left"
              />
            </div>
          </Link>
          <button
            className="shrink-0 rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            aria-label={mobileOpen ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Desktop: two rows — contacts, then logo + nav + search */}
        <div className="hidden md:block">
          {/* Row 1 — contact bar */}
          <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1.5 border-b border-slate-100 py-2 text-xs sm:text-sm">
            <div className="inline-flex min-w-0 max-w-full items-baseline gap-1.5 whitespace-nowrap text-slate-800">
              <span className="shrink-0 text-slate-500">Тел.:</span>
              <CopyToClipboard
                variant="minimal"
                value={COMPANY.phoneE164}
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

          {/* Row 2 — logo, nav, search (icon + popover) */}
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
                  "inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors",
                  "hover:border-blue-300 hover:text-blue-700",
                  "focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:outline-none",
                  searchOpen && "border-blue-400 text-blue-700",
                )}
                onClick={() => setSearchOpen((o) => !o)}
                aria-label="Поиск по каталогу"
                aria-expanded={searchOpen}
                aria-controls="header-search-popover"
                id="header-search-trigger"
              >
                <Search className="h-5 w-5" />
              </button>
              {searchOpen && (
                <div
                  className="absolute right-0 top-full z-50 mt-1.5 w-[min(100vw-1.5rem,20rem)] origin-top-right rounded-xl border border-slate-200 bg-white p-3 shadow-lg"
                  id="header-search-popover"
                  role="search"
                >
                  <form
                    onSubmit={(e) =>
                      handleSearchSubmit(e, desktopSearch, () => {
                        setSearchOpen(false);
                        setDesktopSearch("");
                      })
                    }
                    className="space-y-2"
                  >
                    <label className="relative block">
                      <span className="mb-1 block text-[0.7rem] font-medium uppercase tracking-wide text-slate-500">
                        Поиск по каталогу
                      </span>
                      <div className="relative">
                        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          ref={searchInputRef}
                          type="search"
                          name="q"
                          value={desktopSearch}
                          onChange={(e) => setDesktopSearch(e.target.value)}
                          placeholder="Название, артикул, DN…"
                          aria-label="Поиск по каталогу"
                          className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-2 text-sm text-slate-900 outline-none focus:border-blue-500"
                        />
                      </div>
                    </label>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="inline-flex h-8 items-center rounded-md bg-slate-900 px-3 text-sm font-medium text-white hover:bg-slate-800"
                      >
                        Искать
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile nav panel */}
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
            <form
              role="search"
              className="mt-3 border-t border-slate-200 pt-3"
              onSubmit={(e) =>
                handleSearchSubmit(e, mobileSearch, () => {
                  setMobileSearch("");
                  setMobileOpen(false);
                })
              }
            >
              <label className="relative block">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={mobileSearch}
                  onChange={(e) => setMobileSearch(e.target.value)}
                  placeholder="Поиск по каталогу..."
                  aria-label="Поиск по каталогу"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-blue-400"
                />
              </label>
            </form>
            <div className="mt-3 flex flex-col gap-2 border-t border-slate-200 pt-3 text-sm text-slate-800">
              <div className="px-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Телефон</p>
                <div className="mt-1">
                  <CopyToClipboard
                    variant="minimal"
                    value={COMPANY.phoneE164}
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
