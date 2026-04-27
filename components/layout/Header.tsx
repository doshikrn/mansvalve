"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { Mail, Menu, Phone, Search, X } from "lucide-react";
import {
  COMPANY,
  COMPANY_EMAIL_HREF,
  COMPANY_PHONE_HREF,
  COMPANY_WHATSAPP_BASE_URL,
} from "@/lib/company";
import { WhatsappIcon } from "@/components/icons/WhatsappIcon";
import { CopyToClipboard } from "@/components/contacts/CopyToClipboard";
import { getPageAnalyticsContext, trackEvent } from "@/lib/analytics";

const NAV_LINKS = [
  { label: "Каталог", href: "/catalog" },
  { label: "Как работаем", href: "/#how-it-works" },
  { label: "FAQ", href: "/#faq" },
  { label: "Сертификаты", href: "/certificates" },
  { label: "Контакты", href: "/contacts" },
] as const;

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopSearch, setDesktopSearch] = useState("");
  const [mobileSearch, setMobileSearch] = useState("");

  function handleSearchSubmit(
    e: FormEvent<HTMLFormElement>,
    value: string,
    clear?: () => void,
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
    if (clear) clear();
    window.location.href = `/catalog?q=${encodeURIComponent(query)}`;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
        {/* Mobile / tablet: logo + menu */}
        <div className="flex items-center justify-between gap-2 md:hidden">
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

        {/* Desktop: logo | centered nav | search + contacts */}
        <div className="hidden min-h-14 items-center gap-x-2 md:grid md:grid-cols-[1fr_minmax(0,auto)_1fr] md:items-center">
          <div className="flex min-w-0 justify-start">
            <Link href="/" className="block" aria-label={`Главная — ${COMPANY.name}`}>
              <div className="relative h-14 w-[200px] lg:w-[220px] xl:w-[250px] 2xl:w-[280px]">
                <Image
                  src="/images/logo-mansvalve-light.png"
                  alt={`${COMPANY.name} logo`}
                  fill
                  priority
                  sizes="(max-width: 1280px) 220px, 280px"
                  className="object-contain object-left"
                />
              </div>
            </Link>
          </div>

          <nav
            className="flex max-w-full min-w-0 flex-nowrap justify-center gap-x-2 overflow-x-auto py-0.5 text-sm font-medium text-slate-600 [scrollbar-width:none] lg:gap-x-3 xl:gap-x-4 [&::-webkit-scrollbar]:hidden"
            aria-label="Основная навигация"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="shrink-0 hover:text-blue-700 transition-colors whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex min-w-0 flex-nowrap items-center justify-end gap-1.5 pl-1 xl:gap-2 2xl:gap-2.5">
            <form
              role="search"
              className="hidden min-w-0 max-w-[180px] shrink xl:block 2xl:max-w-[200px]"
              onSubmit={(e) => handleSearchSubmit(e, desktopSearch)}
            >
              <label className="relative block w-full">
                <Search
                  className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 2xl:left-3 2xl:h-4 2xl:w-4"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={desktopSearch}
                  onChange={(e) => setDesktopSearch(e.target.value)}
                  placeholder="Поиск…"
                  aria-label="Поиск по каталогу"
                  className="h-8 w-full min-w-0 rounded-full border border-slate-200 bg-white py-0 pl-8 pr-2.5 text-xs text-slate-700 outline-none transition-colors focus:border-blue-400 2xl:h-9 2xl:pl-9 2xl:pr-3 2xl:text-sm"
                />
              </label>
            </form>

            <div className="inline-flex min-w-0 max-w-full shrink-0 items-center gap-0.5 whitespace-nowrap 2xl:gap-1">
              <Phone className="h-3.5 w-3.5 shrink-0 text-slate-500 2xl:h-4 2xl:w-4" aria-hidden />
              <CopyToClipboard
                value={COMPANY.phoneE164}
                kind="phone"
                className="text-sm font-semibold text-slate-800"
              >
                {COMPANY.phoneDisplay}
              </CopyToClipboard>
              <a
                href={COMPANY_PHONE_HREF}
                className="inline-flex shrink-0 rounded p-0.5 text-slate-500 transition hover:bg-slate-100 hover:text-blue-700 2xl:p-1"
                title="Позвонить"
                aria-label="Позвонить"
              >
                <Phone className="h-3.5 w-3.5 2xl:h-4 2xl:w-4" />
              </a>
            </div>

            <div className="hidden min-w-0 max-w-[14rem] items-center gap-0.5 overflow-hidden 2xl:inline-flex 2xl:whitespace-nowrap">
              <Mail className="h-3.5 w-3.5 shrink-0 text-slate-500 2xl:h-4 2xl:w-4" aria-hidden />
              <CopyToClipboard
                value={COMPANY.email}
                kind="email"
                className="min-w-0 text-sm font-medium text-slate-700"
              >
                <span className="min-w-0 truncate">{COMPANY.email}</span>
              </CopyToClipboard>
              <a
                href={COMPANY_EMAIL_HREF}
                className="inline-flex shrink-0 rounded p-0.5 text-slate-500 transition hover:bg-slate-100 hover:text-blue-700 2xl:p-1"
                title="Написать письмо"
                aria-label="Написать письмо"
              >
                <Mail className="h-3.5 w-3.5 2xl:h-4 2xl:w-4" />
              </a>
            </div>

            <a
              href={COMPANY_WHATSAPP_BASE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-green-500 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-green-600 transition-colors whitespace-nowrap 2xl:px-3 2xl:py-1.5 2xl:text-sm"
            >
              <WhatsappIcon className="h-3.5 w-3.5 2xl:h-4 2xl:w-4" />
              WhatsApp
            </a>
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
                className="block rounded-md px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-700 transition-colors"
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
            <div className="mt-3 flex flex-col gap-2 border-t border-slate-200 pt-3">
              <div className="flex items-start gap-2 px-3 py-2 text-sm text-slate-700">
                <Phone className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
                <div className="min-w-0 flex flex-1 items-center justify-between gap-2">
                  <CopyToClipboard value={COMPANY.phoneE164} kind="phone" className="font-medium text-slate-800">
                    {COMPANY.phoneDisplay}
                  </CopyToClipboard>
                  <a
                    href={COMPANY_PHONE_HREF}
                    className="shrink-0 rounded p-1 text-slate-500 hover:bg-slate-100"
                    title="Позвонить"
                    aria-label="Позвонить"
                  >
                    <Phone className="h-4 w-4" />
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-2 px-3 py-2 text-sm text-slate-700">
                <Mail className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
                <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
                  <CopyToClipboard
                    value={COMPANY.email}
                    kind="email"
                    className="min-w-0 flex-1 font-medium"
                  >
                    <span className="min-w-0 break-words">{COMPANY.email}</span>
                  </CopyToClipboard>
                  <a
                    href={COMPANY_EMAIL_HREF}
                    className="shrink-0 self-start rounded p-1 text-slate-500 hover:bg-slate-100"
                    title="Написать письмо"
                    aria-label="Написать письмо"
                  >
                    <Mail className="h-4 w-4" />
                  </a>
                </div>
              </div>
              <a
                href={COMPANY_WHATSAPP_BASE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 rounded-full bg-green-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-600 transition-colors"
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
