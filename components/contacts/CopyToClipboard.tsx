"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { getPageAnalyticsContext, trackEvent } from "@/lib/analytics";

const RESET_MS = 1700;
const ERROR_MS = 2200;

type CopyToClipboardProps = {
  value: string;
  children: ReactNode;
  /**
   * `default` — small copy icon + underlined value.
   * `minimal` — underlined value only; feedback is the same (badge below, in document flow).
   */
  variant?: "default" | "minimal";
  copiedText?: string;
  className?: string;
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

function CopiedBadge({ text }: { text: string }) {
  return (
    <span
      role="status"
      aria-live="polite"
      className="shrink-0 select-none rounded-md border border-emerald-200/90 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium leading-tight text-emerald-800 shadow-sm"
    >
      {text}
    </span>
  );
}

/**
 * Click copies `value`. Success feedback: small «Скопировано» badge in normal flow, directly under the value (no fixed/absolute to viewport).
 */
export function CopyToClipboard({
  value,
  children,
  variant = "default",
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

  if (variant === "minimal") {
    return (
      <span className="inline-flex max-w-full min-w-0 flex-col items-start gap-1 self-start">
        <button
          type="button"
          onClick={handleClick}
          className={cn(
            "group max-w-full min-w-0 rounded-md text-left transition-colors",
            "inline-flex focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:outline-none",
            "cursor-pointer",
            phase === "error" && "text-amber-800",
            className,
          )}
          title={defaultTitle}
          aria-label={defaultAria}
        >
          {phase === "error" ? (
            <span className="text-xs font-medium">Ошибка копирования</span>
          ) : (
            <span className="min-w-0 border-b border-dotted border-slate-300 group-hover:border-blue-500 group-hover:text-blue-800">
              {children}
            </span>
          )}
        </button>
        {phase === "copied" && <CopiedBadge text={copiedText} />}
      </span>
    );
  }

  return (
    <span className="inline-flex max-w-full min-w-0 flex-col items-start gap-1 self-start">
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "group inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-md text-left transition-colors",
          "cursor-pointer hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:outline-none",
          phase === "error" && "text-amber-800",
          className,
        )}
        title={defaultTitle}
        aria-label={defaultAria}
      >
        {phase === "error" ? (
          <span className="text-xs font-medium">Ошибка копирования</span>
        ) : (
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <Copy
              className={cn(
                "h-3.5 w-3.5 shrink-0 text-slate-400",
                phase === "copied" && "text-emerald-600",
              )}
              aria-hidden="true"
            />
            <span
              className={cn(
                "min-w-0 underline decoration-slate-300 decoration-dotted underline-offset-2 group-hover:decoration-blue-600",
                phase === "copied" && "text-emerald-800 decoration-emerald-200",
              )}
            >
              {children}
            </span>
          </span>
        )}
      </button>
      {phase === "copied" && <CopiedBadge text={copiedText} />}
    </span>
  );
}
