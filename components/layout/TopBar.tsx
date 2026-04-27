"use client";

import Image from "next/image";
import Link from "next/link";
import { Phone } from "lucide-react";
import { COMPANY, COMPANY_TELEGRAM_PUBLIC_HREF, COMPANY_WHATSAPP_BASE_URL } from "@/lib/company";
import { TelegramIcon } from "@/components/icons/TelegramIcon";
import { WhatsappIcon } from "@/components/icons/WhatsappIcon";
import { CopyToClipboard } from "@/components/contacts/CopyToClipboard";
import { HEADER_LOGO_SRC } from "@/components/layout/header-logo";
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
      <div className="mx-auto flex min-h-11 max-w-[1320px] items-center justify-between gap-3 px-5 sm:min-h-12 sm:gap-4 sm:px-7 lg:px-10">
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
          <Link
            href="/"
            className="relative shrink-0 rounded-full ring-1 ring-slate-300/80 shadow-sm"
            aria-label={`${COMPANY.name} — на главную`}
          >
            <Image
              src={HEADER_LOGO_SRC}
              alt=""
              width={80}
              height={80}
              className="h-9 w-9 rounded-full object-cover sm:h-10 sm:w-10"
              sizes="40px"
            />
          </Link>
          <nav
            className="hidden min-w-0 flex-1 items-center gap-2 overflow-x-auto text-[14px] font-medium leading-snug sm:flex sm:gap-3 sm:text-[15px] lg:text-base [&::-webkit-scrollbar]:h-0"
            aria-label="Служебная навигация"
          >
            {TOP_BAR_LINKS.map((item, i) => (
              <span key={item.href} className="inline-flex shrink-0 items-center gap-2 sm:gap-3">
                {i > 0 ? <NavDot /> : null}
                <Link
                  href={item.href}
                  className="whitespace-nowrap text-slate-700 transition-colors hover:text-slate-950"
                >
                  {item.label}
                </Link>
              </span>
            ))}
          </nav>
        </div>

        <div className={cn("flex shrink-0 items-center gap-3 sm:gap-3.5")}>
          {COMPANY_TELEGRAM_PUBLIC_HREF ? (
            <a
              href={COMPANY_TELEGRAM_PUBLIC_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-200/80 hover:text-slate-800"
              aria-label="Telegram"
            >
              <TelegramIcon className="h-[22px] w-[22px]" />
            </a>
          ) : null}
          <a
            href={COMPANY_WHATSAPP_BASE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#25D366]/15 text-[#25D366] ring-1 ring-[#25D366]/25 transition hover:bg-[#25D366]/25"
            aria-label="WhatsApp"
          >
            <WhatsappIcon className="h-[22px] w-[22px]" />
          </a>
          <CopyToClipboard
            variant="minimal"
            value={COMPANY.phoneDisplay}
            messageForCopyToast={COMPANY.phoneDisplay}
            kind="phone"
            title="Нажмите, чтобы скопировать номер"
            className="inline-flex items-center gap-1 text-sm font-semibold tabular-nums text-slate-800 sm:text-[15px] lg:text-base"
          >
            <span className="inline-flex items-center gap-1">
              <Phone className="h-3.5 w-3.5 shrink-0 text-slate-500 sm:hidden" aria-hidden />
              {COMPANY.phoneDisplay}
            </span>
          </CopyToClipboard>
        </div>
      </div>
    </div>
  );
}
