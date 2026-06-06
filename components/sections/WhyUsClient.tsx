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
import { motion } from "framer-motion";
import {
  PREMIUM_VIEWPORT,
  premiumCardBlock,
  premiumIntroBlock,
  premiumStaggerContainer,
} from "@/lib/motion";

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
    <div className="group relative flex h-full min-h-[214px] flex-col overflow-hidden rounded-xl border border-white/[0.11] bg-[linear-gradient(145deg,rgba(15,23,42,0.74),rgba(8,20,40,0.94))] p-5 shadow-[0_18px_52px_-30px_rgb(0_0_0_/_0.72)] transition-[border-color,box-shadow,transform,background-color] duration-300 ease-out hover:-translate-y-[2px] hover:border-[#2F6BFF]/30 hover:shadow-[0_24px_62px_-34px_rgb(0_0_0_/_0.78)] motion-reduce:hover:translate-y-0 sm:p-6">
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-site-cta via-[#2F6BFF] to-transparent opacity-75" />
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#2F6BFF]/10 blur-2xl transition-opacity duration-300 group-hover:opacity-80" />
      <div className="site-icon mb-4 h-12 w-12 shrink-0 border border-site-cta/25 bg-site-cta/12 text-site-cta transition-colors group-hover:bg-site-cta group-hover:text-white">
        <Icon className="h-6 w-6" />
      </div>
      <p className="mb-3 w-fit shrink-0 rounded-full border border-white/[0.1] bg-white/[0.045] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#8bb4ff]">
        {metric}
      </p>
      <h3 className="mb-2 shrink-0 text-base font-bold leading-snug text-slate-50 sm:text-[17px]">{title}</h3>
      <p className="text-sm leading-snug text-slate-400">{desc}</p>
    </div>
  );
}

export function WhyUsClient({ sectionEyebrow, sectionTitle, items }: WhyUsClientProps) {
  return (
    <section className="site-section-dark relative overflow-hidden border-t border-white/[0.06] bg-[#081428]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#2F6BFF]/35 to-transparent" />
      <div className="site-container relative">
        <motion.div
          className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3"
          variants={premiumStaggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={PREMIUM_VIEWPORT}
        >
          <motion.div variants={premiumIntroBlock} className="col-span-full mb-8 max-w-3xl">
            <div className="site-eyebrow text-[#2F6BFF]">{sectionEyebrow}</div>
            <h2 className="site-heading text-white">{sectionTitle}</h2>
          </motion.div>

          {items.map((item, index) => {
            const Icon = ICONS[index] ?? Clock;
            return (
              <motion.div key={`${item.title}-${index}`} variants={premiumCardBlock} className="h-full min-h-0">
                <Card {...item} Icon={Icon} />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
