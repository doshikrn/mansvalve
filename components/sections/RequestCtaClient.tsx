"use client";

import { QuickRequestForm } from "@/components/contacts/QuickRequestForm";
import { COMPANY_WHATSAPP_BASE_URL } from "@/lib/company";
import { motion } from "framer-motion";
import { PREMIUM_VIEWPORT, premiumIntroBlock } from "@/lib/motion";

type RequestCtaClientProps = {
  title: string;
  subtitle: string;
  footerHint: string;
};

export function RequestCtaClient({ title, subtitle, footerHint }: RequestCtaClientProps) {
  return (
    <motion.section
      id="request-section"
      className="scroll-mt-20 bg-site-deep py-16 sm:scroll-mt-24 sm:py-20 md:scroll-mt-32"
      variants={premiumIntroBlock}
      initial="hidden"
      whileInView="visible"
      viewport={PREMIUM_VIEWPORT}
    >
      <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
        <h2 className="mb-3 text-3xl font-bold text-white sm:text-4xl">{title}</h2>
        <p className="mb-8 text-base text-white/90 sm:text-lg">{subtitle}</p>

        <div className="mx-auto max-w-lg rounded-lg border border-white/10 bg-white/[0.06] p-5 text-left shadow-[0_24px_48px_-28px_rgba(0,0,0,0.7)] sm:p-6">
          <QuickRequestForm variant="dark" source="homepage-request-cta" />
        </div>

        <p className="mt-4 text-sm text-white/80">
          {footerHint}{" "}
          <a
            href={COMPANY_WHATSAPP_BASE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-site-whatsapp underline underline-offset-2 hover:text-site-whatsapp-hover hover:no-underline"
          >
            WhatsApp
          </a>
        </p>
      </div>
    </motion.section>
  );
}
