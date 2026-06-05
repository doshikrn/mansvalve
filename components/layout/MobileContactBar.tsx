import { Phone } from "lucide-react";
import { COMPANY, COMPANY_PHONE_HREF, COMPANY_WHATSAPP_BASE_URL } from "@/lib/company";
import { WhatsappIcon } from "@/components/icons/WhatsappIcon";

/**
 * Mobile-only fixed bottom action bar (WhatsApp + Позвонить). Hidden on
 * desktop, where {@link FloatingWhatsApp} renders the sticky WhatsApp card.
 * The matching bottom padding for `<main>` lives in the site layout so the
 * bar never overlaps page content.
 */
export function MobileContactBar() {
  return (
    <nav
      aria-label="Быстрая связь"
      className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-2 gap-px border-t border-site-border bg-site-border pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-2px_10px_rgba(15,27,45,0.08)] sm:hidden"
    >
      <a
        href={COMPANY_WHATSAPP_BASE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-[52px] items-center justify-center gap-2 bg-site-whatsapp text-sm font-semibold text-white transition-colors hover:bg-site-whatsapp-hover"
        aria-label="Написать в WhatsApp"
      >
        <WhatsappIcon className="h-5 w-5" />
        WhatsApp
      </a>
      <a
        href={COMPANY_PHONE_HREF}
        className="flex min-h-[52px] items-center justify-center gap-2 bg-site-card text-sm font-semibold text-site-primary transition-colors hover:bg-site-bg"
        aria-label={`Позвонить: ${COMPANY.phoneDisplay}`}
      >
        <Phone className="h-5 w-5" strokeWidth={2} />
        Позвонить
      </a>
    </nav>
  );
}
