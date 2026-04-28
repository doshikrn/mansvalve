"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type CssRevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Задержка transition после появления в viewport (каскад секций). */
  delay?: number;
};

/**
 * Scroll reveal через CSS transition + IntersectionObserver (без framer-motion).
 * Классы: reveal-up → при входе в зону добавляется is-visible (once).
 */
export function CssReveal({ children, className, delay = 0 }: CssRevealProps) {
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
      {
        threshold: 0.12,
        rootMargin: "0px 0px -80px 0px",
      },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("reveal-up block w-full min-w-0", visible && "is-visible", className)}
      style={{ "--reveal-delay": `${delay}s` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
