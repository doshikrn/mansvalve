"use client";

import Image from "next/image";
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

const BACKGROUNDS = [
  "/images/category-zadvizhki.png",
  "/images/category-zatvory.png",
  "/images/category-klapany.png",
  "/images/category-krany-sharovye.png",
  "/images/category-filtry-i-kompensatory.png",
  "/images/category-flansy-i-otvody.png",
] as const;

export type WhoSegment = { title: string; text: string };

type WhoWeSupplyClientProps = {
  sectionEyebrow: string;
  sectionTitle: string;
  sectionLead: string;
  segments: WhoSegment[];
};

function SegmentCard({
  title,
  text,
  Icon,
  imageSrc,
}: WhoSegment & { Icon: LucideIcon; imageSrc: string }) {
  return (
    <article className="group relative flex h-full min-h-[164px] flex-col overflow-hidden rounded-xl border border-slate-800 bg-[#081428] p-5 shadow-[0_22px_46px_-34px_rgba(15,23,42,0.75)] transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-[2px] hover:border-site-primary/45 hover:shadow-[0_28px_58px_-38px_rgba(15,23,42,0.85)] motion-reduce:hover:translate-y-0 sm:p-6">
      <Image
        src={imageSrc}
        alt=""
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover opacity-[0.42] transition-transform duration-500 ease-out group-hover:scale-[1.035]"
        aria-hidden
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,12,25,0.96)_0%,rgba(8,20,40,0.9)_48%,rgba(8,20,40,0.68)_100%)]" aria-hidden />
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-site-primary via-site-cta to-transparent" />
      <span className="absolute right-4 top-4 z-[2] inline-flex items-center gap-1 rounded-md border border-white/15 bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-white backdrop-blur">
        <CircleCheck className="h-3 w-3" aria-hidden />
        B2B
      </span>
      <div className="relative z-[2] flex flex-1 gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-[#8bb4ff] transition-transform duration-300 group-hover:scale-105">
          <Icon className="h-5 w-5" aria-hidden />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <h3 className="pr-14 text-base font-bold leading-snug text-white sm:text-[17px]">{title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-300 sm:text-[15px]">{text}</p>
          <span className="mt-4 inline-flex w-fit rounded-md border border-white/12 bg-white/8 px-2.5 py-1 text-[11px] font-semibold text-slate-200">
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
    <section className="site-section bg-[#f5f8fc]">
      <div className="site-container">
        <motion.div
          className="grid list-none grid-cols-1 items-stretch gap-4 p-0 md:grid-cols-2 md:gap-5"
          variants={premiumStaggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={PREMIUM_VIEWPORT}
        >
          <motion.div variants={premiumIntroBlock} className="col-span-full mb-8 max-w-3xl md:col-span-2">
            <div className="site-eyebrow">{sectionEyebrow}</div>
            {sectionTitle ? <h2 className="site-heading">{sectionTitle}</h2> : null}
            <p className="site-copy mt-3">{sectionLead}</p>
          </motion.div>

          {segments.map((seg, index) => {
            const Icon = ICONS[index] ?? Building2;
            const imageSrc = BACKGROUNDS[index % BACKGROUNDS.length] ?? BACKGROUNDS[0];
            return (
              <motion.div key={`${seg.title}-${index}`} variants={premiumCardBlock} className="min-h-0 min-w-0 h-full">
                <SegmentCard {...seg} Icon={Icon} imageSrc={imageSrc} />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
