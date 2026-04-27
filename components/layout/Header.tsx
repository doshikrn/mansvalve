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
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo */}
        <Link href="/" className="block" aria-label={`Главная — ${COMPANY.name}`}>
          <div className="relative h-14 w-[210px] sm:w-[240px] xl:w-[300px]">
            <Image
              src="/images/logo-mansvalve-light.png"
              alt={`${COMPANY.name} logo`}
              fill
              priority
              sizes="(max-width: 640px) 210px, (max-width: 1280px) 240px, 300px"
              className="object-contain object-left"
            />
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden gap-3 text-sm font-medium text-slate-600 lg:gap-5 xl:gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-blue-700 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop search */}
        <form
          role="search"
          className="hidden xl:flex xl:w-72"
          onSubmit={(e) => handleSearchSubmit(e, desktopSearch)}
        >
          <label className="relative block w-full">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={desktopSearch}
              onChange={(e) => setDesktopSearch(e.target.value)}
              placeholder="Поиск по каталогу..."
              aria-label="Поиск по каталогу"
              className="h-9 w-full rounded-full border border-slate-200 bg-white pl-9 pr-4 text-sm text-slate-700 outline-none transition-colors focus:border-blue-400"
            />
          </label>
        </form>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <a
            href={COMPANY_PHONE_HREF}
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-800 hover:text-blue-700 transition-colors"
          >
            <Phone className="h-4 w-4" />
            {COMPANY.phoneDisplay}
          </a>
          <a
            href={COMPANY_EMAIL_HREF}
            className="hidden items-center gap-1.5 text-sm font-medium text-slate-700 transition-colors hover:text-blue-700 xl:flex"
          >
            <Mail className="h-4 w-4" />
            {COMPANY.email}
          </a>
          <a
            href={COMPANY_WHATSAPP_BASE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-green-600 transition-colors"
          >
            <WhatsappIcon className="h-4 w-4" />
            WhatsApp
          </a>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors md:hidden"
          aria-label={mobileOpen ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
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
              <a
                href={COMPANY_PHONE_HREF}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700"
              >
                <Phone className="h-4 w-4" />
                {COMPANY.phoneDisplay}
              </a>
              <a
                href={COMPANY_EMAIL_HREF}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700"
              >
                <Mail className="h-4 w-4" />
                {COMPANY.email}
              </a>
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
