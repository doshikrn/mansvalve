"use client";

import { motion } from "framer-motion";
import { PREMIUM_VIEWPORT, premiumIntroBlock } from "@/lib/motion";

export function TrustStripClient({ children }: { children: React.ReactNode }) {
  return (
    <motion.section
      aria-label="О компании"
      className="border-b border-white/[0.06] bg-transparent py-6 sm:py-7"
      variants={premiumIntroBlock}
      initial="hidden"
      whileInView="visible"
      viewport={PREMIUM_VIEWPORT}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">{children}</div>
    </motion.section>
  );
}
