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
 * Обёртка над секциями: motion.div (block, на всю ширину), без display:contents.
 * Вне viewport: opacity 0, y 48; при prefers-reduced-motion — сразу финальное состояние.
 */
export function ScrollReveal({ children, className, delay = 0 }: ScrollRevealProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={cn("block w-full min-w-0", className)}
      initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{
        duration: reduce ? 0 : 0.8,
        ease: MOTION_EASE,
        delay: reduce ? 0 : delay,
      }}
    >
      {children}
    </motion.div>
  );
}
