"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import {
  COMPANY,
  COMPANY_PHONE_HREF,
  COMPANY_TELEGRAM_PUBLIC_HREF,
  COMPANY_WHATSAPP_BASE_URL,
} from "@/lib/company";
import { WhatsappIcon } from "@/components/icons/WhatsappIcon";
import { TelegramIcon } from "@/components/icons/TelegramIcon";
import { CopyToClipboard } from "@/components/contacts/CopyToClipboard";
import { CatalogSearchPanel } from "@/components/search/CatalogSearchPanel";

const TOP_LINKS = [
  { label: "О компании", href: "/about" },
  { label: "Сертификаты", href: "/certificates" },
  { label: "Доставка", href: "/delivery" },
  { label: "Контакты", href: "/contacts" },
] as const;

const LOGO_SRC = "/images/logo-mansvalve.png";

function NavSeparators() {
  return (
    <span className="hidden text-slate-300 sm:inline" aria-hidden>
      &nbsp;·&nbsp;
    </span>
  );
}

export function Header() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const goToCatalog = (q: string) => {
    router.push(`/catalog?q=${encodeURIComponent(q)}`);
  };

  useEffect(() => {
    if (!mobileOpen && !mobileSearchOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setMobileSearchOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen, mobileSearchOpen]);

  useEffect(() => {
    if (!mobileSearchOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileSearchOpen]);

  return (
    <header className="sticky top-0 z-40">
      {/* Top utility bar */}
      <div className="border-b border-slate-200/80 bg-slate-100/95 text-slate-600">
        <div className="mx-auto flex max-w-7xl flex-col gap-1.5 px-3 py-1.5 sm:px-6 sm:py-2 sm:text-[13px] sm:leading-tight">
          <div className="flex w-full min-w-0 items-center justify-between gap-2">
            <nav
              className="hidden min-w-0 sm:flex sm:flex-1 sm:items-baseline sm:overflow-x-auto [scrollbar-width:thin] [&::-webkit-scrollbar]:h-0"
              aria-label="Служебная навигация"
            >
              {TOP_LINKS.map((item, i) => (
                <span key={item.href} className="inline-flex shrink-0 items-center text-[12px] font-medium">
                  {i > 0 ? <NavSeparators /> : null}
                  <Link
                    href={item.href}
                    className="whitespace-nowrap text-slate-600 transition-colors hover:text-slate-900"
                  >
                    {item.label}
                  </Link>
                </span>
              ))}
            </nav>

            <div className="ml-auto flex shrink-0 items-center gap-2.5 sm:gap-3">
              {COMPANY_TELEGRAM_PUBLIC_HREF ? (
                <a
                  href={COMPANY_TELEGRAM_PUBLIC_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-200/80 hover:text-slate-800"
                  aria-label="Telegram"
                >
                  <TelegramIcon className="h-4 w-4" />
                </a>
              ) : null}
              <a
                href={COMPANY_WHATSAPP_BASE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#25D366] transition hover:bg-slate-200/80"
                aria-label="WhatsApp"
              >
                <WhatsappIcon className="h-4 w-4" />
              </a>
              <a
                href={COMPANY_PHONE_HREF}
                className="inline-flex items-center gap-0.5 text-[12px] font-semibold text-slate-800 tabular-nums sm:text-[13px]"
                title="Позвонить"
              >
                {COMPANY.phoneDisplay}
                <ChevronDown className="h-3 w-3 text-slate-400" aria-hidden />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main bar */}
        <div className="border-b border-slate-200/80 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-3 sm:px-6">
          <div className="flex min-h-14 items-center justify-between gap-2 py-2.5 sm:min-h-16 sm:py-3 lg:gap-4">
            <Link
              href="/"
              className="group shrink-0 p-0"
              aria-label={`Главная — ${COMPANY.name}`}
            >
              <div className="relative h-11 w-11 sm:h-12 sm:w-12">
                <Image
                  src={LOGO_SRC}
                  alt={`${COMPANY.name} — логотип`}
                  width={48}
                  height={48}
                  className="h-11 w-11 rounded-full object-cover object-center sm:h-12 sm:w-12"
                  priority
                  quality={100}
                />
              </div>
            </Link>

            <div className="min-w-0 flex-1 px-1 sm:px-2 lg:max-w-3xl lg:flex-none xl:max-w-4xl">
              <div className="hidden lg:block">
                <CatalogSearchPanel
                  variant="headerBar"
                  isOpen
                  onClose={() => undefined}
                  onSearchSubmit={goToCatalog}
                  inputId="header-search-q"
                  analyticsSource="header-bar"
                />
              </div>
            </div>

            <div className="hidden shrink-0 text-right text-xs text-slate-600 lg:block lg:max-w-[12rem] xl:max-w-[15rem]">
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                Для заявок:
              </p>
              <div className="mt-0.5">
                <CopyToClipboard
                  variant="minimal"
                  value={COMPANY.email}
                  messageForCopyToast={COMPANY.email}
                  kind="email"
                  title={COMPANY.email}
                  className="!inline-block max-w-full truncate text-left text-sm font-medium text-slate-900 hover:text-blue-800"
                >
                  {COMPANY.email}
                </CopyToClipboard>
              </div>
              <Link
                href="/delivery"
                className="mt-1.5 inline-block text-left text-sm font-medium text-slate-700 transition hover:text-blue-700"
              >
                Оплата и доставка
              </Link>
            </div>

            <div className="flex items-center gap-0.5 lg:hidden">
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100"
                onClick={() => {
                  setMobileSearchOpen(true);
                  setMobileOpen(false);
                }}
                aria-label="Поиск по каталогу"
              >
                <Search className="h-5 w-5" strokeWidth={1.75} />
              </button>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md text-slate-600 transition hover:bg-slate-100"
                onClick={() => {
                  setMobileOpen((o) => !o);
                  setMobileSearchOpen(false);
                }}
                aria-label={mobileOpen ? "Закрыть меню" : "Открыть меню"}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {mobileSearchOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-slate-900/50 p-3 pt-4 lg:hidden"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setMobileSearchOpen(false);
          }}
        >
          <div className="w-full max-w-lg" onMouseDown={(e) => e.stopPropagation()}>
            <CatalogSearchPanel
              variant="modal"
              isOpen
              onClose={() => setMobileSearchOpen(false)}
              onSearchSubmit={goToCatalog}
              inputId="modal-search-q"
              analyticsSource="header-modal"
            />
          </div>
        </div>
      )}

      {mobileOpen && (
        <div
          className="border-t border-slate-200 bg-white shadow-sm lg:hidden"
          id="site-mobile-menu"
        >
          <nav className="mx-auto max-w-7xl space-y-0.5 px-3 py-3" aria-label="Навигация по разделу">
            <Link
              href="/catalog"
              onClick={() => setMobileOpen(false)}
              className="block rounded-md px-3 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Каталог
            </Link>
            {TOP_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-md px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/delivery"
              onClick={() => setMobileOpen(false)}
              className="block rounded-md px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Оплата и доставка
            </Link>
            <div className="my-1 border-t border-slate-100" />
            <p className="px-3 pt-1 text-[10px] font-medium uppercase text-slate-500">Для заявок:</p>
            <div className="px-3 py-1.5 text-sm">
              <CopyToClipboard
                variant="minimal"
                value={COMPANY.email}
                messageForCopyToast={COMPANY.email}
                kind="email"
                className="w-full"
              >
                {COMPANY.email}
              </CopyToClipboard>
            </div>
            <div className="px-3 py-1.5">
              <CopyToClipboard
                variant="minimal"
                value={COMPANY.phoneE164}
                messageForCopyToast={COMPANY.phoneDisplay}
                kind="phone"
                className="tabular-nums"
              >
                {COMPANY.phoneDisplay}
              </CopyToClipboard>
            </div>
            <p className="px-3 pt-2 text-[10px] font-medium uppercase text-slate-500">Связь</p>
            <div className="mt-1 flex flex-wrap items-center gap-2 px-3">
              {COMPANY_TELEGRAM_PUBLIC_HREF ? (
                <a
                  href={COMPANY_TELEGRAM_PUBLIC_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-700"
                >
                  <TelegramIcon className="h-4 w-4" />
                  Telegram
                </a>
              ) : null}
              <a
                href={COMPANY_WHATSAPP_BASE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-[#25D366] px-3 text-sm font-medium text-white"
              >
                <WhatsappIcon className="h-4 w-4" />
                WhatsApp
              </a>
            </div>
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                setMobileSearchOpen(true);
              }}
              className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Search className="h-4 w-4 text-slate-500" strokeWidth={1.75} />
              Поиск по каталогу (полноэкранно)
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
