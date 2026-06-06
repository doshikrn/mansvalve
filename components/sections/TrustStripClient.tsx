"use client";

import { motion } from "framer-motion";
import { PREMIUM_VIEWPORT, premiumIntroBlock } from "@/lib/motion";

export function TrustStripClient({ children }: { children: React.ReactNode }) {
  return (
    <motion.section
      aria-label="О компании"
      className="site-section-tight border-b border-white/[0.06] bg-[#081428]"
      variants={premiumIntroBlock}
      initial="hidden"
      whileInView="visible"
      viewport={PREMIUM_VIEWPORT}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="site-industrial-panel rounded-xl px-4 py-4 shadow-[0_20px_48px_-32px_rgba(0,0,0,0.75)] sm:px-6 sm:py-5">
          {children}
        </div>
      </div>
    </motion.section>
  );
}
