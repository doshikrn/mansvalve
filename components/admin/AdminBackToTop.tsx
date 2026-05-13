"use client";

import { ArrowUp } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SCROLL_ROOT_ID = "admin-scroll-main";
const SHOW_AFTER_PX = 320;

/**
 * Floating control; listens to the admin layout scroll region (not window).
 */
export function AdminBackToTop() {
  const [visible, setVisible] = useState(false);
  const [shortPage, setShortPage] = useState(true);
  const raf = useRef<number | null>(null);

  const refresh = useCallback(() => {
    const el = document.getElementById(SCROLL_ROOT_ID);
    if (!el) {
      setVisible(false);
      setShortPage(true);
      return;
    }
    const { scrollTop, clientHeight, scrollHeight } = el;
    const scrollable = scrollHeight > clientHeight + 80;
    setShortPage(!scrollable);
    setVisible(scrollable && scrollTop > SHOW_AFTER_PX);
  }, []);

  useEffect(() => {
    const el = document.getElementById(SCROLL_ROOT_ID);
    if (!el) return;

    const onScroll = () => {
      if (raf.current != null) cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(refresh);
    };

    const initialId = requestAnimationFrame(() => {
      refresh();
    });

    el.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(() => {
      if (raf.current != null) cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(refresh);
    });
    ro.observe(el);

    return () => {
      cancelAnimationFrame(initialId);
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
      if (raf.current != null) cancelAnimationFrame(raf.current);
    };
  }, [refresh]);

  const scrollToTop = useCallback(() => {
    document.getElementById(SCROLL_ROOT_ID)?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (shortPage && !visible) return null;

  return (
    <Button
      type="button"
      variant="secondary"
      size="icon"
      aria-label="Наверх"
      title="Наверх"
      className={cn(
        "pointer-events-auto fixed bottom-5 right-5 z-[60] size-11 rounded-full shadow-lg transition-opacity duration-200 md:bottom-8 md:right-8",
        visible ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      onClick={scrollToTop}
    >
      <ArrowUp className="size-5" aria-hidden />
    </Button>
  );
}
