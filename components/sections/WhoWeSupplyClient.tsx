"use client";

import {
  Building2,
  CircleCheck,
  Droplets,
  Factory,
  Fuel,
  Landmark,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import {
  PREMIUM_VIEWPORT,
  premiumCardBlock,
  premiumIntroBlock,
  premiumStaggerContainer,
} from "@/lib/motion";

const ICONS = [Building2, Fuel, Factory, Wrench, Droplets, Landmark] as const satisfies readonly LucideIcon[];

export type WhoSegment = { title: string; text: string };

type WhoWeSupplyClientProps = {
  sectionEyebrow: string;
  sectionTitle: string;
  sectionLead: string;
  segments: WhoSegment[];
};

function SegmentCard({ title, text, Icon }: WhoSegment & { Icon: LucideIcon }) {
  return (
    <article className="site-card group relative flex h-full flex-col overflow-hidden p-5 sm:p-6">
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-site-primary/0 via-site-primary/65 to-site-primary/0" />
      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-site-primary/85 via-site-primary/45 to-transparent" />
      <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-md border border-site-primary/25 bg-site-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-site-primary">
        <CircleCheck className="h-3 w-3" aria-hidden />
        B2B
      </span>
      <div className="flex flex-1 gap-4">
        <div className="site-icon shrink-0 self-start transition-transform duration-300 group-hover:scale-105">
          <Icon className="h-5 w-5" aria-hidden />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <h3 className="pr-14 text-base font-bold text-site-ink sm:text-[17px]">{title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-site-muted sm:text-[15px]">{text}</p>
          <span className="mt-4 inline-flex w-fit rounded-md border border-site-border bg-site-bg px-2.5 py-1 text-[11px] font-semibold text-site-muted">
            Корпоративные поставки
          </span>
        </div>
      </div>
    </article>
  );
}

export function WhoWeSupplyClient({
  sectionEyebrow,
  sectionTitle,
  sectionLead,
  segments,
}: WhoWeSupplyClientProps) {
  return (
    <section className="site-section">
      <div className="site-container">
        <motion.div
          className="grid list-none grid-cols-1 items-stretch gap-4 p-0 md:grid-cols-2 md:gap-5"
          variants={premiumStaggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={PREMIUM_VIEWPORT}
        >
          <motion.div variants={premiumIntroBlock} className="col-span-full mb-10 max-w-3xl md:col-span-2">
            <div className="site-eyebrow">{sectionEyebrow}</div>
            <h2 className="site-heading">{sectionTitle}</h2>
            <p className="site-copy mt-3">{sectionLead}</p>
          </motion.div>

          {segments.map((seg, index) => {
            const Icon = ICONS[index] ?? Building2;
            return (
              <motion.div key={`${seg.title}-${index}`} variants={premiumCardBlock} className="min-h-0 min-w-0 h-full">
                <SegmentCard {...seg} Icon={Icon} />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
