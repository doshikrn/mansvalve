import { COMPANY_WHATSAPP_BASE_URL } from "@/lib/company";
import { WhatsappIcon } from "@/components/icons/WhatsappIcon";

/**
 * Desktop sticky WhatsApp call-to-action (bottom-right). Hidden on mobile,
 * where {@link MobileContactBar} renders the fixed bottom action bar instead.
 */
export function FloatingWhatsApp() {
  return (
    <a
      href={COMPANY_WHATSAPP_BASE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="group fixed bottom-6 right-6 z-50 hidden items-center gap-3 rounded-2xl bg-site-whatsapp px-4 py-3 text-white shadow-lg shadow-site-deep/20 transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-site-whatsapp-hover sm:flex"
      aria-label="Написать в WhatsApp — менеджер онлайн, ответим за 15 минут"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15">
        <WhatsappIcon className="h-6 w-6" />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-sm font-bold">WhatsApp</span>
        <span className="text-xs font-medium text-white/90">Менеджер онлайн</span>
        <span className="text-xs text-white/80">Ответим за 15 минут</span>
      </span>
    </a>
  );
}
