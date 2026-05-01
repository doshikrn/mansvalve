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
    <div className="group rounded-lg border border-white/[0.08] bg-white/[0.04] p-6 shadow-[0_10px_40px_-12px_rgb(0_0_0_/_0.45)] backdrop-blur-sm transition-[border-color,box-shadow,transform] duration-300 ease-out hover:-translate-y-[2px] hover:border-white/15 hover:bg-white/[0.06] hover:shadow-[0_16px_48px_-16px_rgb(0_0_0_/_0.55)] motion-reduce:hover:translate-y-0">
      <div className="site-icon mb-4 h-12 w-12 border border-white/5 bg-site-primary/15 transition-colors group-hover:bg-site-primary group-hover:text-white">
        <Icon className="h-6 w-6" />
      </div>
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-site-tech">{metric}</p>
      <h3 className="mb-1 text-base font-bold text-slate-50 sm:text-[17px]">{title}</h3>
      <p className="text-sm leading-snug text-slate-400">{desc}</p>
    </div>
  );
}

export function WhyUsClient({ sectionEyebrow, sectionTitle, items }: WhyUsClientProps) {
  return (
    <section className="relative bg-transparent pb-16 pt-8 sm:pb-20 sm:pt-10">
      <div className="site-container">
        <motion.div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          variants={premiumStaggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={PREMIUM_VIEWPORT}
        >
          <motion.div variants={premiumIntroBlock} className="col-span-full mb-10 max-w-3xl">
            <div className="site-eyebrow text-[#2F6BFF]">{sectionEyebrow}</div>
            <h2 className="site-heading text-white">{sectionTitle}</h2>
          </motion.div>

          {items.map((item, index) => {
            const Icon = ICONS[index] ?? Clock;
            return (
              <motion.div key={`${item.title}-${index}`} variants={premiumCardBlock}>
                <Card {...item} Icon={Icon} />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
