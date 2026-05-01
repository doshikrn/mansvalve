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
        <div className="rounded-lg border border-white/[0.1] bg-white/[0.04] px-4 py-4 shadow-[0_20px_40px_-28px_rgba(0,0,0,0.6)] sm:px-6">
          {children}
        </div>
      </div>
    </motion.section>
  );
}
