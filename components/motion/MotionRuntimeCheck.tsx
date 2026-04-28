"use client";

import { useEffect } from "react";

/**
 * Одноразовая проверка DOM после paint (runtime).
 * Лог: только development или при NEXT_PUBLIC_MOTION_CHECK=1.
 * ?motionCssDebug=1 — включает html[data-motion-css-debug] для чистой CSS-анимации reveal-debug в globals.css.
 */
export function MotionRuntimeCheck() {
  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    if (params.get("motionCssDebug") === "1") {
      document.documentElement.setAttribute("data-motion-css-debug", "1");
    }

    const logEnabled =
      process.env.NODE_ENV !== "production" ||
      process.env.NEXT_PUBLIC_MOTION_CHECK === "1";

    const run = () => {
      console.info("[motion-check]", {
        cssRevealCount: document.querySelectorAll('[data-motion="css-reveal"]').length,
        revealUpCount: document.querySelectorAll(".reveal-up").length,
        productSlide: Boolean(document.querySelector('[data-motion="product-slide"]')),
      });
    };

    if (!logEnabled) return;

    requestAnimationFrame(() => {
      requestAnimationFrame(run);
    });
  }, []);

  return null;
}
