"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import { COMPANY, COMPANY_PHONE_HREF, COMPANY_WHATSAPP_BASE_URL } from "@/lib/company";
import { WhatsappIcon } from "@/components/icons/WhatsappIcon";

const NAV_LINKS = [
  { label: "Каталог", href: "/catalog" },
  { label: "Как работаем", href: "/#how-it-works" },
  { label: "FAQ", href: "/#faq" },
  { label: "Сертификаты", href: "/certificates" },
  { label: "Контакты", href: "/contacts" },
] as const;

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo */}
        <Link href="/" className="block" aria-label={`Главная — ${COMPANY.name}`}>
          <div className="relative h-14 w-[290px] sm:w-[320px]">
            <Image
              src="/images/logo-mansvalve-light.png"
              alt={`${COMPANY.name} logo`}
              fill
              priority
              sizes="(max-width: 640px) 290px, 320px"
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
            <div className="mt-3 flex flex-col gap-2 border-t border-slate-200 pt-3">
              <a
                href={COMPANY_PHONE_HREF}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700"
              >
                <Phone className="h-4 w-4" />
                {COMPANY.phoneDisplay}
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
