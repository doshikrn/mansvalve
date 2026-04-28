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
import { MOTION_DURATION, MOTION_EASE } from "@/lib/motion";

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

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: MOTION_DURATION.medium, ease: MOTION_EASE },
  },
};

export function WhoWeSupplyClient({
  sectionEyebrow,
  sectionTitle,
  sectionLead,
  segments,
}: WhoWeSupplyClientProps) {
  return (
    <section className="site-section">
      <div className="site-container">
        <div className="mb-10 max-w-3xl">
          <div className="site-eyebrow">{sectionEyebrow}</div>
          <h2 className="site-heading">{sectionTitle}</h2>
          <p className="site-copy mt-3">{sectionLead}</p>
        </div>

        <motion.ul
          className="grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2 md:gap-5"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {segments.map((seg, index) => {
            const Icon = ICONS[index] ?? Building2;
            return (
              <motion.li key={`${seg.title}-${index}`} variants={itemVariants} className="min-w-0">
                <SegmentCard {...seg} Icon={Icon} />
              </motion.li>
            );
          })}
        </motion.ul>
      </div>
    </section>
  );
}
