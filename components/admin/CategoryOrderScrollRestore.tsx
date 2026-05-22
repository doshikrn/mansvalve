"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * After reorder server actions, scroll to the affected row (`?focus=cat-12` or `sub-34`).
 */
export function CategoryOrderScrollRestore() {
  const params = useSearchParams();
  const lastHandled = useRef<string | null>(null);

  useEffect(() => {
    const focus = params.get("focus")?.trim();
    if (!focus) return;
    const key = `${focus}:${params.get("msg") ?? ""}`;
    if (lastHandled.current === key) return;
    lastHandled.current = key;
    const el = document.getElementById(`taxonomy-row-${focus}`);
    if (el) {
      el.scrollIntoView({ block: "center", behavior: "smooth" });
      el.classList.add("ring-2", "ring-blue-300", "ring-offset-2");
      window.setTimeout(() => {
        el.classList.remove("ring-2", "ring-blue-300", "ring-offset-2");
      }, 1600);
    }
  }, [params]);

  return null;
}
