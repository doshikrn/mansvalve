"use client";

import {
  Building2,
  Clock,
  FileCheck2,
  MapPin,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { staggerContainer, staggerItem, motionTransition, MOTION_EASE } from "@/lib/motion";

const ICONS = [Clock, ShieldCheck, Wallet, FileCheck2, MapPin, Building2] as const satisfies readonly LucideIcon[];

export type WhyUsItem = { metric: string; title: string; desc: string };

type WhyUsClientProps = {
  sectionEyebrow: string;
  sectionTitle: string;
  items: WhyUsItem[];
};

function Card({
  metric,
  title,
  desc,
  Icon,
}: WhyUsItem & { Icon: LucideIcon }) {
  return (
    <div className="site-card group p-6">
      <div className="site-icon mb-4 h-12 w-12">
        <Icon className="h-6 w-6" />
      </div>
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-site-primary">{metric}</p>
      <h3 className="mb-1 text-base font-bold text-site-ink sm:text-[17px]">{title}</h3>
      <p className="text-sm leading-snug text-site-muted">{desc}</p>
    </div>
  );
}

export function WhyUsClient({ sectionEyebrow, sectionTitle, items }: WhyUsClientProps) {
  const reduce = useReducedMotion();

  const header = (
    <div className="mb-10 max-w-3xl">
      <div className="site-eyebrow">{sectionEyebrow}</div>
      <h2 className="site-heading">{sectionTitle}</h2>
    </div>
  );

  const grid = reduce ? (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, index) => (
        <Card key={`${item.title}-${index}`} {...item} Icon={ICONS[index] ?? Clock} />
      ))}
    </div>
  ) : (
    <motion.div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px 0px", amount: 0.12 }}
      transition={{ ...motionTransition.medium, ease: MOTION_EASE }}
    >
      {items.map((item, index) => {
        const Icon = ICONS[index] ?? Clock;
        return (
          <motion.div key={`${item.title}-${index}`} variants={staggerItem}>
            <Card {...item} Icon={Icon} />
          </motion.div>
        );
      })}
    </motion.div>
  );

  return (
    <section className="site-section">
      <div className="site-container">
        {header}
        {grid}
      </div>
    </section>
  );
}
