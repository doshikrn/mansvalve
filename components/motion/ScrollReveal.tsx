"use client";

import { motion, useReducedMotion } from "framer-motion";
import { fadeUp, motionTransition, MOTION_EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

type ScrollRevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Задержка появления (сек), для каскада секций */
  delay?: number;
  /**
   * Отступ «зоны» viewport (когда начинать анимацию). Отрицательные значения —
   * триггер раньше, пока блок ещё ниже края экрана.
   */
  viewportMargin?: string;
};

/**
 * Появление при скролле: fade + сдвиг на 24px вверх (через variants.fadeUp).
 * `once: true`, уважает `prefers-reduced-motion`.
 */
export function ScrollReveal({
  children,
  className,
  delay = 0,
  viewportMargin = "-56px 0px -32px 0px",
}: ScrollRevealProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={cn(className)}>{children}</div>;
  }

  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: viewportMargin, amount: 0.14 }}
      variants={fadeUp}
      transition={{
        ...motionTransition.medium,
        ease: MOTION_EASE,
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}
