"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type ScrollRevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Задержка появления (сек), для каскада секций */
  delay?: number;
};

/**
 * Появление при скролле через CSS keyframes + IntersectionObserver (не зависит от framer-motion).
 * Совпадает с прежней целью: opacity 0→1, y 32→0, ~0.6s, threshold 15%, once.
 * DOM: div[data-scroll-reveal-root], класс .animate-reveal-up + .animate-reveal-up--visible
 */
export function ScrollReveal({ children, className, delay = 0 }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px" },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-scroll-reveal-root="true"
      data-scroll-reveal-visible={visible ? "true" : "false"}
      style={{ "--reveal-delay": `${delay}s` } as React.CSSProperties}
      className={cn("animate-reveal-up", visible && "animate-reveal-up--visible", className)}
    >
      {children}
    </div>
  );
}
