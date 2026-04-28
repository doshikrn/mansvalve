"use client";

import { cn } from "@/lib/utils";

type CssRevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Зарезервировано; не используется (CssReveal временно без scroll-reveal). */
  delay?: number;
};

/**
 * Временно без `.reveal-up` и IntersectionObserver — обёртка для стабильной вёрстки,
 * чтобы не конфликтовать с framer-motion и гидратацией.
 */
export function CssReveal({ children, className }: CssRevealProps) {
  return <div className={cn("block w-full min-w-0", className)}>{children}</div>;
}
