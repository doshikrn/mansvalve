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
    <section id="how-it-works" className="site-section">
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
          className="relative"
          variants={stepsStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ ...PREMIUM_VIEWPORT, amount: 0.28 }}
        >
          <div className="absolute left-[8%] right-[8%] top-7 hidden h-px bg-gradient-to-r from-site-primary/15 via-site-primary/40 to-site-primary/15 lg:block" />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map((step, index) => {
              const Icon = STEP_ICONS[index] ?? ClipboardList;
              return (
                <motion.div key={step.num} variants={premiumCardBlock}>
                  <div className="site-card relative flex h-full flex-col p-5 lg:min-h-[220px]">
                    <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-site-primary/0 via-site-primary/55 to-site-primary/0" />
                    <div
                      className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full border border-site-primary/35 bg-site-primary/10 text-site-primary shadow-sm"
                      aria-label="Стандартный этап"
                      title="Стандартный этап"
                    >
                      <Check className="size-4" strokeWidth={2.75} aria-hidden />
                    </div>

                    <div className="relative z-10 mb-4 flex h-14 w-14 items-center justify-center rounded-lg border border-site-primary/30 bg-site-card text-lg font-bold text-site-primary shadow-sm">
                      {step.num}
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
