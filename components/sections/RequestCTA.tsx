import { QuickRequestForm } from "@/components/contacts/QuickRequestForm";
import { COMPANY_WHATSAPP_BASE_URL } from "@/lib/company";
import { resolveRequestCta } from "@/lib/site-content/public";

export async function RequestCTA() {
  const { title, subtitle, footerHint } = await resolveRequestCta();

  return (
    <section
      id="request-section"
      className="scroll-mt-20 sm:scroll-mt-24 md:scroll-mt-32 bg-site-primary py-20 sm:py-24"
    >
      <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
        <h2 className="mb-3 text-3xl font-bold text-white sm:text-4xl">{title}</h2>
        <p className="mb-8 text-base text-white/90 sm:text-lg">{subtitle}</p>

        <div className="mx-auto max-w-lg text-left">
          <QuickRequestForm variant="dark" source="homepage-request-cta" />
        </div>

        <p className="mt-4 text-sm text-white/80">
          {footerHint}{" "}
          <a
            href={COMPANY_WHATSAPP_BASE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-white underline underline-offset-2 hover:no-underline"
          >
            WhatsApp
          </a>
        </p>
      </div>
    </section>
  );
}
