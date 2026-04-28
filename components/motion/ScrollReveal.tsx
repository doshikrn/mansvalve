"use client";

import { motion, useReducedMotion } from "framer-motion";
import { MOTION_EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

type ScrollRevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Задержка появления (сек), для каскада секций */
  delay?: number;
};

/**
 * Появление при скролле: opacity 0 → 1, y 32 → 0, duration 0.6s.
 * Viewport: once, amount 0.15 (без отрицательного margin — он ужесточал IntersectionObserver).
 * При prefers-reduced-motion — duration 0, без скрытия контента на первом кадре.
 */
export function ScrollReveal({ children, className, delay = 0 }: ScrollRevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const duration = prefersReducedMotion ? 0 : 0.6;

  return (
    <motion.div
      className={cn(className)}
      initial={
        prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }
      }
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration,
        ease: MOTION_EASE,
        delay: prefersReducedMotion ? 0 : delay,
      }}
    >
      {children}
    </motion.div>
  );
}
