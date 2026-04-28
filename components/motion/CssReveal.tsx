"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type CssRevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Задержка transition после появления в viewport (каскад секций). */
  delay?: number;
};

/**
 * Scroll reveal: CSS `.reveal-up` + класс `.is-visible` только после IntersectionObserver.
 * Перед observe — requestAnimationFrame, чтобы браузер отрисовал начальное opacity:0 / transform.
 * При prefers-reduced-motion стили из globals показывают контент без ожидания observer.
 */
export function CssReveal({ children, className, delay = 0 }: CssRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    () => false,
  );

  useEffect(() => {
    if (prefersReducedMotion) return;

    const el = ref.current;
    if (!el) return;

    let observer: IntersectionObserver | undefined;
    const rafId = requestAnimationFrame(() => {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) {
            setVisible(true);
            observer?.disconnect();
          }
        },
        {
          threshold: 0.12,
          rootMargin: "0px 0px -80px 0px",
        },
      );
      observer.observe(el);
    });

    return () => {
      cancelAnimationFrame(rafId);
      observer?.disconnect();
    };
  }, [prefersReducedMotion]);

  return (
    <div
      ref={ref}
      data-motion="css-reveal"
      data-visible={
        prefersReducedMotion || visible ? "true" : "false"
      }
      className={cn("reveal-up block w-full min-w-0", visible && "is-visible", className)}
      style={{ "--reveal-delay": `${delay}s` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
