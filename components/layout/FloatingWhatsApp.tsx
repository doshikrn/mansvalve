import { COMPANY_WHATSAPP_BASE_URL } from "@/lib/company";
import { WhatsappIcon } from "@/components/icons/WhatsappIcon";

export function FloatingWhatsApp() {
  return (
    <a
      href={COMPANY_WHATSAPP_BASE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 hidden h-14 w-14 items-center justify-center rounded-lg bg-site-whatsapp shadow-lg shadow-site-deep/20 transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-site-whatsapp-hover sm:flex"
      aria-label="Написать в WhatsApp"
    >
      <WhatsappIcon className="h-7 w-7 text-white" />
    </a>
  );
}
