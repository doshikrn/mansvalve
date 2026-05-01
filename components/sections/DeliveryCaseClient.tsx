"use client";

import { CalendarRange, CheckCircle2, Factory, Package } from "lucide-react";
import { motion } from "framer-motion";
import {
  PREMIUM_VIEWPORT,
  premiumCardBlock,
  premiumIntroBlock,
  premiumStaggerContainer,
} from "@/lib/motion";

function MetaPill({ icon: Icon, label, value }: { icon: typeof Package; label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-start gap-2.5 rounded-lg border border-site-border bg-site-bg px-3 py-2.5 sm:items-center">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-site-primary/25 bg-site-primary/10">
        <Icon className="h-3.5 w-3.5 text-site-primary" aria-hidden strokeWidth={1.9} />
      </span>
      <div className="min-w-0 text-xs sm:text-sm">
        <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-site-muted">{label}</p>
        <p className="break-words font-semibold leading-snug text-site-ink [overflow-wrap:anywhere]">{value}</p>
      </div>
    </div>
  );
}

export type DeliveryCaseItem = {
  object: string;
  title: string;
  text: string;
  positions: string;
  termLabel: string;
  term: string;
  result: string;
};

export type DeliveryCaseContent = {
  sectionEyebrow: string;
  sectionTitle: string;
  sectionLead: string;
  summaryCasesValue: string;
  summaryCasesLabel: string;
  summaryDaysValue: string;
  summaryDaysLabel: string;
  summaryUnitsValue: string;
  summaryUnitsLabel: string;
  kitMetaLabel: string;
  objectMetaLabel: string;
  resultPrefix: string;
  cases: DeliveryCaseItem[];
};

const casesStagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.12,
    },
  },
};

export function DeliveryCaseClient(content: DeliveryCaseContent) {
  return (
    <section className="site-section" aria-labelledby="cases-heading">
      <div className="site-container">
        <motion.div
          variants={premiumStaggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={PREMIUM_VIEWPORT}
        >
          <motion.div
            variants={premiumIntroBlock}
            className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
          >
            <div className="max-w-3xl">
              <div className="site-eyebrow">{content.sectionEyebrow}</div>
              <h2 id="cases-heading" className="site-heading">
                {content.sectionTitle}
              </h2>
              <p className="site-copy mt-3">{content.sectionLead}</p>
            </div>
            <div className="grid grid-cols-3 overflow-hidden rounded-lg border border-site-border bg-site-card text-center shadow-[0_14px_28px_-20px_rgba(15,27,45,0.35)] lg:min-w-[360px]">
              <div className="border-r border-site-border px-3 py-3">
                <p className="text-lg font-bold text-site-ink">{content.summaryCasesValue}</p>
                <p className="text-[10px] font-semibold uppercase text-site-muted">{content.summaryCasesLabel}</p>
              </div>
              <div className="border-r border-site-border px-3 py-3">
                <p className="text-lg font-bold text-site-ink">{content.summaryDaysValue}</p>
                <p className="text-[10px] font-semibold uppercase text-site-muted">{content.summaryDaysLabel}</p>
              </div>
              <div className="px-3 py-3">
                <p className="text-lg font-bold text-site-ink">{content.summaryUnitsValue}</p>
                <p className="text-[10px] font-semibold uppercase text-site-muted">{content.summaryUnitsLabel}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.ul
          className="grid list-none gap-4 p-0 lg:grid-cols-2"
          variants={casesStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ ...PREMIUM_VIEWPORT, amount: 0.28 }}
        >
          {content.cases.map((c, index) => (
            <motion.li key={`${c.title}-${index}`} variants={premiumCardBlock} className="site-card overflow-hidden p-0">
              <div className="grid h-full grid-rows-[auto_1fr_auto]">
                <div className="relative flex items-start gap-4 border-b border-site-border bg-site-bg px-5 py-4">
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-site-primary/0 via-site-primary/55 to-site-primary/0" />
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-site-primary/25 bg-site-primary text-sm font-bold text-white shadow-[0_10px_20px_-12px_rgba(47,107,255,0.7)]">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase text-site-muted">{c.object}</p>
                    <h3 className="mt-1 text-base font-bold leading-snug text-site-ink sm:text-lg">{c.title}</h3>
                  </div>
                  <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-md border border-site-primary/20 bg-site-primary/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-site-primary">
                    <CheckCircle2 className="h-3 w-3" aria-hidden />
                    Завершено
                  </span>
                </div>

                <div className="px-5 py-4">
                  <p className="text-sm leading-relaxed text-site-muted sm:text-[15px]">{c.text}</p>

                  <div className="mt-5 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3 sm:[grid-template-columns:minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
                    <MetaPill icon={Package} label={content.kitMetaLabel} value={c.positions} />
                    <MetaPill icon={CalendarRange} label={c.termLabel} value={c.term} />
                    <MetaPill icon={Factory} label={content.objectMetaLabel} value={c.object} />
                  </div>
                </div>

                <div className="flex gap-3 border-t border-site-border bg-white px-5 py-4">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-site-primary/10">
                    <CheckCircle2 className="h-4 w-4 text-site-primary" aria-hidden strokeWidth={2} />
                  </span>
                  <p className="text-sm font-medium leading-relaxed text-site-ink">
                    <span className="font-bold text-site-ink">{content.resultPrefix} </span>
                    {c.result}
                  </p>
                </div>
              </div>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
