"use client";

import { motion } from "framer-motion";
import {
  Check,
  ClipboardList,
  FileSpreadsheet,
  FileText,
  PackageCheck,
  Truck,
} from "lucide-react";
import { PREMIUM_VIEWPORT, premiumCardBlock, premiumIntroBlock } from "@/lib/motion";

export type HowItWorksStep = { num: string; title: string; desc: string };

type HowItWorksClientProps = {
  sectionEyebrow: string;
  sectionTitle: string;
  steps: HowItWorksStep[];
};

const stepsStagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.12,
    },
  },
};

const STEP_ICONS = [ClipboardList, FileSpreadsheet, FileText, PackageCheck, Truck] as const;

export function HowItWorksClient({ sectionEyebrow, sectionTitle, steps }: HowItWorksClientProps) {
  return (
    <section id="how-it-works" className="site-section bg-white">
      <div className="site-container">
        <motion.div
          variants={premiumIntroBlock}
          initial="hidden"
          whileInView="visible"
          viewport={PREMIUM_VIEWPORT}
          className="mb-10 max-w-3xl"
        >
          <div className="site-eyebrow">{sectionEyebrow}</div>
          <h2 className="site-heading">{sectionTitle}</h2>
        </motion.div>

        <motion.div
          className="relative rounded-2xl border border-slate-200 bg-[#f8fbff] px-4 py-6 shadow-[0_22px_48px_-38px_rgba(15,23,42,0.48)] sm:px-6 lg:px-7"
          variants={stepsStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ ...PREMIUM_VIEWPORT, amount: 0.28 }}
        >
          <div className="absolute left-[9%] right-[9%] top-[4.15rem] hidden h-px bg-gradient-to-r from-site-primary/15 via-site-primary/45 to-site-primary/15 lg:block" />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map((step, index) => {
              const Icon = STEP_ICONS[index] ?? ClipboardList;
              return (
                <motion.div key={step.num} variants={premiumCardBlock}>
                  <div className="relative flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-[2px] hover:border-site-primary/35 hover:shadow-[0_22px_44px_-36px_rgba(15,23,42,0.48)] motion-reduce:hover:translate-y-0 lg:min-h-[188px]">
                    <div className="relative z-10 mb-4 flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[3px] border-[#f8fbff] bg-site-primary text-sm font-bold text-white shadow-[0_10px_24px_-14px_rgba(47,107,255,0.75)]">
                        {step.num}
                      </div>
                      <span
                        className="flex size-8 items-center justify-center rounded-lg bg-site-cta/10 text-site-cta"
                        aria-label="Стандартный этап"
                        title="Стандартный этап"
                      >
                        <Check className="size-4" strokeWidth={2.75} aria-hidden />
                      </span>
                    </div>
                    <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-md border border-site-primary/20 bg-site-primary/8 px-2.5 py-1 text-[11px] font-semibold text-site-primary">
                      <Icon className="h-3.5 w-3.5" aria-hidden />
                      Этап
                    </span>
                    <h3 className="mb-2 text-sm font-bold uppercase text-site-ink sm:text-base">{step.title}</h3>
                    <p className="text-sm leading-relaxed text-site-muted">{step.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
