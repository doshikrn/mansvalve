"use client";

import Link from "next/link";
import { ChevronDown, Phone } from "lucide-react";
import {
  COMPANY,
  COMPANY_PHONE_HREF,
  COMPANY_TELEGRAM_PUBLIC_HREF,
  COMPANY_WHATSAPP_BASE_URL,
} from "@/lib/company";
import { TelegramIcon } from "@/components/icons/TelegramIcon";
import { WhatsappIcon } from "@/components/icons/WhatsappIcon";
import { cn } from "@/lib/utils";

export const TOP_BAR_LINKS = [
  { label: "О компании", href: "/about" },
  { label: "Сертификаты", href: "/certificates" },
  { label: "Доставка", href: "/delivery" },
  { label: "Контакты", href: "/contacts" },
] as const;

function NavDot() {
  return (
    <span className="hidden text-slate-300 sm:inline" aria-hidden>
      ·
    </span>
  );
}

export function TopBar() {
  return (
    <div className="border-b border-slate-200/90 bg-[#eceff3] text-slate-600">
      <div className="mx-auto flex min-h-10 max-w-[1320px] items-center justify-between gap-4 px-5 sm:min-h-11 sm:px-7 lg:px-10">
        <nav
          className="hidden min-w-0 flex-1 items-center gap-2 overflow-x-auto text-[12px] font-medium leading-tight sm:flex sm:gap-3 [&::-webkit-scrollbar]:h-0"
          aria-label="Служебная навигация"
        >
          {TOP_BAR_LINKS.map((item, i) => (
            <span key={item.href} className="inline-flex shrink-0 items-center gap-2 sm:gap-3">
              {i > 0 ? <NavDot /> : null}
              <Link
                href={item.href}
                className="whitespace-nowrap text-slate-600 transition-colors hover:text-slate-900"
              >
                {item.label}
              </Link>
            </span>
          ))}
        </nav>

        <div className={cn("flex shrink-0 items-center gap-2.5 sm:gap-3", "ml-auto sm:ml-0")}>
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
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#25D366] transition hover:bg-slate-200/70"
            aria-label="WhatsApp"
          >
            <WhatsappIcon className="h-4 w-4" />
          </a>
          <a
            href={COMPANY_PHONE_HREF}
            className="inline-flex items-center gap-1 text-[12px] font-semibold tabular-nums text-slate-800 sm:text-[13px]"
            title="Позвонить"
          >
            <Phone className="h-3.5 w-3.5 text-slate-500 sm:hidden" aria-hidden />
            <span>{COMPANY.phoneDisplay}</span>
            <ChevronDown className="hidden h-3 w-3 text-slate-400 sm:inline" aria-hidden />
          </a>
        </div>
      </div>
    </div>
  );
}
