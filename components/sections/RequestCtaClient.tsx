"use client";

import { QuickRequestForm } from "@/components/contacts/QuickRequestForm";
import { COMPANY, COMPANY_WHATSAPP_BASE_URL } from "@/lib/company";
import { motion } from "framer-motion";
import { FileText, ShieldCheck, TimerReset } from "lucide-react";
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
      className="relative z-[1] scroll-mt-20 overflow-hidden border-t border-site-deep bg-site-deep py-16 sm:scroll-mt-24 sm:py-20 md:scroll-mt-32"
      variants={premiumIntroBlock}
      initial="hidden"
      whileInView="visible"
      viewport={PREMIUM_VIEWPORT}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#141C2C] via-[#0B1220] to-[#10192e]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 top-1/2 h-[380px] w-[380px] -translate-y-1/2 rounded-full opacity-[0.18]"
        style={{
          background: "radial-gradient(circle, #2F6BFF 0%, transparent 70%)",
        }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-2xl px-4 text-center sm:px-6">
        <h2 className="mb-3 text-3xl font-bold text-white sm:text-4xl">{title}</h2>
        <p className="mb-8 text-base text-white/90 sm:text-lg">{subtitle}</p>

        <div className="mx-auto mb-5 flex max-w-lg flex-wrap justify-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-white/12 bg-white/[0.06] px-2.5 py-1 text-white/85">
            <TimerReset className="h-3.5 w-3.5 text-site-cta" aria-hidden />
            КП за 15 минут
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-white/12 bg-white/[0.06] px-2.5 py-1 text-white/85">
            <ShieldCheck className="h-3.5 w-3.5 text-site-primary" aria-hidden />
            НДС и документы
          </span>
        </div>

        <div className="mx-auto max-w-lg rounded-lg border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.05)_100%)] p-5 text-left shadow-[0_30px_60px_-34px_rgba(0,0,0,0.8)] sm:p-6">
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
          <span className="mx-2 text-white/40">·</span>
          <a
            href={`mailto:${COMPANY.email}`}
            className="inline-flex items-center gap-1 font-semibold text-site-soft-blue underline underline-offset-2 hover:text-white hover:no-underline"
          >
            <FileText className="h-3.5 w-3.5" aria-hidden />
            Email
          </a>
        </p>
      </div>
    </motion.section>
  );
}
