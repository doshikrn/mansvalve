"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { getPageAnalyticsContext, trackEvent } from "@/lib/analytics";

const RESET_MS = 1800;
const ERROR_MS = 2200;

type CopyToClipboardProps = {
  value: string;
  children: ReactNode;
  /** Shown for ~1.8s after a successful copy (replaces `children` briefly). */
  copiedText?: string;
  className?: string;
  /** For analytics: `phone_click` / `email_click` with `source: "copy"`. */
  kind?: "phone" | "email";
  "aria-label"?: string;
  title?: string;
};

async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to legacy method.
    }
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

/**
 * Click copies `value` to the clipboard and shows “Скопировано” feedback.
 * Pair with a separate `tel:` / `mailto:` control when call/open is needed.
 */
export function CopyToClipboard({
  value,
  children,
  copiedText = "Скопировано",
  className,
  kind,
  "aria-label": ariaLabel,
  title,
}: CopyToClipboardProps) {
  const [phase, setPhase] = useState<"idle" | "copied" | "error">("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const defaultTitle = title ?? "Скопировать в буфер обмена";
  const defaultAria =
    ariaLabel ??
    (kind === "phone"
      ? `Скопировать номер телефона, ${value}`
      : kind === "email"
        ? `Скопировать адрес e-mail: ${value}`
        : `Скопировать: ${value}`);

  const runAnalytics = useCallback(() => {
    const pageContext = getPageAnalyticsContext();
    if (kind === "phone") {
      trackEvent("phone_click", {
        source: "copy",
        interaction: "copy_to_clipboard",
        value,
        product_slug: pageContext.product_slug,
        category: pageContext.category,
      });
    } else if (kind === "email") {
      trackEvent("email_click", {
        source: "copy",
        interaction: "copy_to_clipboard",
        value,
        product_slug: pageContext.product_slug,
        category: pageContext.category,
      });
    }
  }, [kind, value]);

  const handleClick = useCallback(async () => {
    if (resetTimer.current) {
      clearTimeout(resetTimer.current);
      resetTimer.current = null;
    }
    const ok = await copyTextToClipboard(value);
    if (ok) {
      setPhase("copied");
      if (kind) runAnalytics();
      resetTimer.current = setTimeout(() => {
        setPhase("idle");
        resetTimer.current = null;
      }, RESET_MS);
    } else {
      setPhase("error");
      resetTimer.current = setTimeout(() => {
        setPhase("idle");
        resetTimer.current = null;
      }, ERROR_MS);
    }
  }, [value, kind, runAnalytics]);

  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "group inline-flex max-w-full min-w-0 items-center gap-1 rounded-md text-left transition-colors",
        "cursor-pointer hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:outline-none",
        phase === "error" && "text-amber-800",
        phase === "copied" && "text-emerald-700",
        className,
      )}
      title={defaultTitle}
      aria-label={defaultAria}
    >
      {phase === "copied" ? (
        <span className="inline-flex min-w-0 items-center gap-1.5 font-medium">
          <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {copiedText}
        </span>
      ) : phase === "error" ? (
        <span className="text-xs font-medium">Ошибка копирования</span>
      ) : (
        <span className="inline-flex min-w-0 items-center gap-1.5">
          <Copy className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
          <span className="min-w-0 underline decoration-slate-300 decoration-dotted underline-offset-2 group-hover:decoration-blue-600">
            {children}
          </span>
        </span>
      )}
    </button>
  );
}
