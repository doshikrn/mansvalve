"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * TEMP runtime-only: два индикатора под hero — framer-motion vs CSS.
 * Удалить импорт из app/(site)/page.tsx после проверки в DevTools.
 */
export function MotionRuntimeDiagnostic() {
  const cssBarRef = useRef<HTMLDivElement>(null);
  const [cssTriggered, setCssTriggered] = useState(false);

  useEffect(() => {
    const el = cssBarRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) setCssTriggered(true);
      },
      { threshold: 0.05, rootMargin: "0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      aria-hidden
      className="border-b border-dashed border-site-border/80 bg-site-bg"
      data-motion-runtime-diagnostic="true"
    >
      <div className="site-container grid gap-2 py-2">
        <motion.div
          data-framer-motion-diagnostic="true"
          className="h-3 w-full max-w-md rounded-sm bg-site-primary/30"
          initial={{ opacity: 0, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.05 }}
          transition={{ duration: 1.2 }}
        />
        <div
          ref={cssBarRef}
          data-css-motion-diagnostic="true"
          className={cn(
            "h-3 w-full max-w-md rounded-sm bg-site-cta/35 motion-reduce:opacity-100 motion-reduce:translate-y-0",
            !cssTriggered && "opacity-0 translate-y-[80px]",
            cssTriggered && "motion-runtime-diagnostic-css",
          )}
        />
      </div>
    </div>
  );
}
