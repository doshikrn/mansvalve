"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { MOTION_DURATION, MOTION_EASE, PREMIUM_VIEWPORT, premiumIntroBlock } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type FaqItem = { q: string; a: string };

type FAQAccordionProps = {
  sectionEyebrow: string;
  sectionTitle: string;
  sectionDescription?: string;
  footerLine?: string;
  items: FaqItem[];
  variant?: "default" | "embedded";
};

const panelVariants = {
  open: { height: "auto", opacity: 1 },
  closed: { height: 0, opacity: 0 },
};

const panelTransition = {
  duration: MOTION_DURATION.medium,
  ease: MOTION_EASE,
};

export function FAQAccordion({
  sectionEyebrow,
  sectionTitle,
  sectionDescription,
  footerLine,
  items,
  variant = "default",
}: FAQAccordionProps) {
  const embedded = variant === "embedded";
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section id="faq" className={cn(embedded ? "min-w-0" : "site-section")}>
      <div className={cn(embedded ? "min-w-0" : "mx-auto max-w-3xl px-4 sm:px-6")}>
        <motion.div
          className={cn(embedded ? "mb-5" : "mb-10")}
          variants={premiumIntroBlock}
          initial="hidden"
          whileInView="visible"
          viewport={PREMIUM_VIEWPORT}
        >
          <div className={cn(embedded ? "mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-site-cta" : "site-eyebrow")}>
            {sectionEyebrow}
          </div>
          <h2 className={cn(embedded ? "text-xl font-bold tracking-tight text-white sm:text-2xl" : "site-heading")}>
            {sectionTitle}
          </h2>
          {sectionDescription && !embedded ? (
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-site-muted">
              {sectionDescription}
            </p>
          ) : null}
        </motion.div>

        <div className="space-y-3">
          {items.map(({ q, a }, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={`faq-${i}`}
                className={cn(
                  "overflow-hidden rounded-lg border shadow-sm transition-[box-shadow,border-color,background-color] duration-300 ease-out",
                  embedded
                    ? "border-white/12 bg-white/[0.06]"
                    : "site-card-quiet border-site-border bg-site-card",
                  isOpen &&
                    (embedded
                      ? "border-site-primary/35 bg-white/[0.09] shadow-md"
                      : "border-site-primary/35 bg-[#fafdff] shadow-md"),
                )}
                data-open={isOpen}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => toggle(i)}
                  className={cn(
                    "flex w-full cursor-pointer list-none items-center justify-between gap-4 px-4 py-3.5 text-left text-sm font-semibold transition-colors duration-200 sm:px-5 sm:py-4 sm:text-base",
                    embedded
                      ? "text-slate-100 hover:text-white"
                      : "text-site-ink hover:text-site-primary",
                    isOpen && (embedded ? "text-white" : "text-site-primary"),
                  )}
                >
                  <span className="inline-flex min-w-0 items-center gap-2.5">
                    <span
                      className={cn(
                        "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition-colors",
                        embedded
                          ? isOpen
                            ? "border-site-primary/35 bg-site-primary/15 text-site-soft-blue"
                            : "border-white/12 bg-white/[0.06] text-slate-400"
                          : isOpen
                            ? "border-site-primary/30 bg-site-primary/10 text-site-primary"
                            : "border-site-border bg-site-bg text-site-muted",
                      )}
                    >
                      <HelpCircle className="h-4 w-4" aria-hidden />
                    </span>
                    <span>{q}</span>
                  </span>
                  <span
                    className={cn(
                      "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition-colors",
                      embedded
                        ? isOpen
                          ? "border-site-primary/35 bg-site-primary/15 text-site-soft-blue"
                          : "border-white/12 bg-white/[0.06] text-slate-400"
                        : isOpen
                          ? "border-site-primary/30 bg-site-primary/10 text-site-primary"
                          : "border-site-border bg-site-bg text-site-muted",
                    )}
                  >
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-300 ease-out",
                        isOpen && "rotate-180",
                      )}
                    />
                  </span>
                </button>

                <motion.div
                  initial={false}
                  animate={isOpen ? "open" : "closed"}
                  variants={panelVariants}
                  transition={panelTransition}
                  className={cn("overflow-hidden border-t", embedded ? "border-white/10" : "border-site-border/80")}
                >
                  <div
                    className={cn(
                      "px-4 pb-4 pt-3 text-sm leading-relaxed sm:px-5 sm:pb-5 sm:pt-4",
                      embedded ? "text-slate-300" : "text-site-muted",
                    )}
                  >
                    {a}
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
        {footerLine && !embedded ? (
          <p className="mt-6 text-sm font-semibold text-site-ink">{footerLine}</p>
        ) : null}
      </div>
    </section>
  );
}
