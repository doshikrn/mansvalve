"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import {
  COMPANY,
  COMPANY_TELEGRAM_PUBLIC_HREF,
  COMPANY_WHATSAPP_BASE_URL,
} from "@/lib/company";
import { TelegramIcon } from "@/components/icons/TelegramIcon";
import { WhatsappIcon } from "@/components/icons/WhatsappIcon";
import { CopyToClipboard } from "@/components/contacts/CopyToClipboard";
import { CatalogSearchPanel } from "@/components/search/CatalogSearchPanel";
import { HeaderCategoryBar } from "@/components/layout/HeaderCategoryBar";
import { MainHeader } from "@/components/layout/MainHeader";
import { TopBar, TOP_BAR_LINKS } from "@/components/layout/TopBar";
import type { HeaderCategoryLink } from "@/components/layout/header-types";

export type HeaderProps = {
  categoryLinks?: HeaderCategoryLink[];
};

export function Header({ categoryLinks = [] }: HeaderProps) {
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
    <header className="sticky top-0 z-40 w-full bg-white shadow-sm shadow-slate-900/5">
      <TopBar />
      <MainHeader
        onSearchSubmit={goToCatalog}
        onOpenMobileSearch={() => {
          setMobileSearchOpen(true);
          setMobileOpen(false);
        }}
        onToggleMobileNav={() => {
          setMobileOpen((o) => !o);
          setMobileSearchOpen(false);
        }}
        mobileNavOpen={mobileOpen}
      />
      <HeaderCategoryBar links={categoryLinks} />

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
          <nav className="mx-auto max-w-[1320px] space-y-0.5 px-5 py-3 sm:px-7" aria-label="Навигация по разделу">
            <Link
              href="/catalog"
              onClick={() => setMobileOpen(false)}
              className="block rounded-md px-3 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Каталог
            </Link>
            {TOP_BAR_LINKS.map((link) => (
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
