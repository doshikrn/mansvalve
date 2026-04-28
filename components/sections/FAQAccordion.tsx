"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { MOTION_DURATION, MOTION_EASE, PREMIUM_VIEWPORT, premiumIntroBlock } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type FaqItem = { q: string; a: string };

type FAQAccordionProps = {
  sectionEyebrow: string;
  sectionTitle: string;
  items: FaqItem[];
};

const panelVariants = {
  open: { height: "auto", opacity: 1 },
  closed: { height: 0, opacity: 0 },
};

const panelTransition = {
  duration: MOTION_DURATION.medium,
  ease: MOTION_EASE,
};

export function FAQAccordion({ sectionEyebrow, sectionTitle, items }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section id="faq" className="site-section">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <motion.div
          className="mb-10"
          variants={premiumIntroBlock}
          initial="hidden"
          whileInView="visible"
          viewport={PREMIUM_VIEWPORT}
        >
          <div className="site-eyebrow">{sectionEyebrow}</div>
          <h2 className="site-heading">{sectionTitle}</h2>
        </motion.div>

        <div className="space-y-3">
          {items.map(({ q, a }, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={`faq-${i}`}
                className={cn(
                  "site-card-quiet overflow-hidden rounded-lg border border-site-border bg-site-card shadow-sm transition-[box-shadow,border-color] duration-300 ease-out",
                  isOpen && "border-site-primary/35 shadow-md",
                )}
                data-open={isOpen}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => toggle(i)}
                  className={cn(
                    "flex w-full cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left text-base font-semibold text-site-ink transition-colors duration-200 hover:text-site-primary",
                    isOpen && "text-site-primary",
                  )}
                >
                  {q}
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 shrink-0 text-site-muted transition-transform duration-300 ease-out",
                      isOpen && "rotate-180 text-site-primary",
                    )}
                  />
                </button>

                <motion.div
                  initial={false}
                  animate={isOpen ? "open" : "closed"}
                  variants={panelVariants}
                  transition={panelTransition}
                  className="overflow-hidden border-t border-site-border/80"
                >
                  <div className="px-5 pb-5 pt-4 text-sm leading-relaxed text-site-muted">{a}</div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
