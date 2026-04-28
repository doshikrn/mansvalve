"use client";

import {
  Building2,
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
    <article className="site-card p-5 sm:p-6">
      <div className="flex gap-4">
        <div className="site-icon">
          <Icon className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-bold text-site-ink sm:text-[17px]">{title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-site-muted sm:text-[15px]">{text}</p>
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
          className="grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2 md:gap-5"
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
              <motion.div key={`${seg.title}-${index}`} variants={premiumCardBlock} className="min-w-0">
                <SegmentCard {...seg} Icon={Icon} />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
