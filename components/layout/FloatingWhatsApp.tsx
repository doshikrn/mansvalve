import { COMPANY_WHATSAPP_BASE_URL } from "@/lib/company";
import { WhatsappIcon } from "@/components/icons/WhatsappIcon";

export function FloatingWhatsApp() {
  return (
    <a
      href={COMPANY_WHATSAPP_BASE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] right-4 z-50 flex h-12 w-12 items-center justify-center rounded-lg bg-site-whatsapp shadow-lg shadow-site-deep/20 transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-site-whatsapp-hover sm:bottom-6 sm:right-6 sm:h-14 sm:w-14"
      aria-label="Написать в WhatsApp"
    >
      <WhatsappIcon className="h-6 w-6 text-white sm:h-7 sm:w-7" />
    </a>
  );
}
