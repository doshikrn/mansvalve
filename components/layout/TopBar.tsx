"use client";

import Link from "next/link";
import { Phone } from "lucide-react";
import { COMPANY, COMPANY_TELEGRAM_PUBLIC_HREF, COMPANY_WHATSAPP_BASE_URL } from "@/lib/company";
import { TelegramIcon } from "@/components/icons/TelegramIcon";
import { WhatsappIcon } from "@/components/icons/WhatsappIcon";
import { CopyToClipboard } from "@/components/contacts/CopyToClipboard";
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
    <div className="border-b border-site-border bg-site-surface text-site-muted">
      <div className="mx-auto flex min-h-10 max-w-[1320px] items-center justify-between gap-3 px-5 sm:min-h-11 sm:px-7 lg:px-10">
        <nav
          className="hidden min-w-0 flex-1 items-center gap-2 overflow-x-auto text-[14px] font-medium leading-snug sm:flex sm:gap-3 sm:text-[15px] lg:text-base [&::-webkit-scrollbar]:h-0"
          aria-label="Служебная навигация"
        >
          {TOP_BAR_LINKS.map((item, i) => (
            <span key={item.href} className="inline-flex shrink-0 items-center gap-2 sm:gap-3">
              {i > 0 ? <NavDot /> : null}
              <Link
                href={item.href}
                className="whitespace-nowrap text-site-muted transition-colors hover:text-site-ink"
              >
                {item.label}
              </Link>
            </span>
          ))}
        </nav>

        <div className={cn("flex shrink-0 items-center gap-3 sm:gap-3.5", "ml-auto sm:ml-0")}>
          {COMPANY_TELEGRAM_PUBLIC_HREF ? (
            <a
              href={COMPANY_TELEGRAM_PUBLIC_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-site-muted transition hover:bg-white/70 hover:text-site-ink"
              aria-label="Telegram"
            >
              <TelegramIcon className="h-[22px] w-[22px]" />
            </a>
          ) : null}
          <a
            href={COMPANY_WHATSAPP_BASE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-site-whatsapp text-white shadow-sm transition hover:bg-site-whatsapp-hover"
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
            className="inline-flex items-center gap-1 text-sm font-semibold tabular-nums text-site-ink sm:text-[15px] lg:text-base"
          >
            <span className="inline-flex items-center gap-1">
              <Phone className="h-3.5 w-3.5 shrink-0 text-site-muted sm:hidden" aria-hidden />
              {COMPANY.phoneDisplay}
            </span>
          </CopyToClipboard>
        </div>
      </div>
    </div>
  );
}
