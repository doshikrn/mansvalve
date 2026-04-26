import { COMPANY_WHATSAPP_BASE_URL } from "@/lib/company";
import { WhatsappIcon } from "@/components/icons/WhatsappIcon";

export function FloatingWhatsApp() {
  return (
    <a
      href={COMPANY_WHATSAPP_BASE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 shadow-lg transition-transform hover:scale-110 hover:bg-green-600"
      aria-label="Написать в WhatsApp"
    >
      <WhatsappIcon className="h-7 w-7 text-white" />
    </a>
  );
}
