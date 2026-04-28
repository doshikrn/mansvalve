"use client";

import { MotionConfig } from "framer-motion";

/** Единый reduced-motion для публичного сайта (без различий SSR/CSR в variants). */
export function PublicMotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
