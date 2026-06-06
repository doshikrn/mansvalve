"use client";

import { CalendarRange, CheckCircle2, Factory, Package } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  PREMIUM_VIEWPORT,
  premiumCardBlock,
  premiumIntroBlock,
  premiumStaggerContainer,
} from "@/lib/motion";

function MetaPill({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: typeof Package;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 items-start gap-2 rounded-lg border border-slate-200 bg-[#f8fbff] px-2.5 py-2", className)}>
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-site-primary/10 text-site-primary">
        <Icon className="h-3.5 w-3.5" aria-hidden strokeWidth={1.9} />
      </span>
      <div className="min-w-0 flex-1 text-xs sm:text-sm">
        <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-site-muted">{label}</p>
        <p className="font-semibold leading-snug text-site-ink [overflow-wrap:normal] [word-break:normal]">
          {value}
        </p>
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
    <section className="site-section bg-[#f5f8fc]" aria-labelledby="cases-heading">
      <div className="site-container">
        <motion.div
          variants={premiumStaggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={PREMIUM_VIEWPORT}
        >
          <motion.div variants={premiumIntroBlock} className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="site-eyebrow">{content.sectionEyebrow}</div>
              <h2 id="cases-heading" className="site-heading">
                {content.sectionTitle}
              </h2>
              <p className="site-copy mt-3">{content.sectionLead}</p>
            </div>
            <div className="grid grid-cols-3 overflow-hidden rounded-xl border border-slate-200 bg-white text-center shadow-[0_18px_38px_-30px_rgba(15,23,42,0.42)] lg:min-w-[360px]">
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
          className="grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-5"
          variants={casesStagger}
          initial="visible"
          whileInView="visible"
          viewport={{ ...PREMIUM_VIEWPORT, amount: 0.28 }}
        >
          {content.cases.map((c, index) => (
            <motion.li key={`${c.title}-${index}`} variants={premiumCardBlock} className="h-full">
              <article className="group relative flex h-full min-h-[248px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-[0_18px_42px_-34px_rgba(15,23,42,0.5)] transition hover:-translate-y-[2px] hover:border-site-primary/35 hover:shadow-[0_26px_54px_-38px_rgba(15,23,42,0.62)] motion-reduce:hover:translate-y-0">
                <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-site-primary via-site-cta to-transparent" />
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-site-primary text-xs font-bold text-white shadow-[0_10px_20px_-12px_rgba(47,107,255,0.7)]">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-site-cta/20 bg-site-cta/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-site-cta">
                    <CheckCircle2 className="h-3 w-3" aria-hidden />
                    Завершено
                  </span>
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-site-primary">{c.object}</p>
                <h3 className="mt-2 line-clamp-3 text-sm font-bold leading-snug text-site-ink sm:text-base">{c.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-site-muted">{c.text}</p>

                <div className="mt-4 grid min-w-0 grid-cols-1 gap-2">
                  <MetaPill icon={Package} label={content.kitMetaLabel} value={c.positions} />
                  <MetaPill icon={CalendarRange} label={c.termLabel} value={c.term} />
                  <MetaPill icon={Factory} label={content.objectMetaLabel} value={c.object} />
                </div>

                <div className="mt-auto flex gap-2 border-t border-slate-200 pt-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-site-cta" aria-hidden strokeWidth={2} />
                  <p className="min-w-0 flex-1 text-xs font-medium leading-relaxed text-site-ink">
                    <span className="font-bold text-site-ink">{content.resultPrefix} </span>
                    {c.result}
                  </p>
                </div>
              </article>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
