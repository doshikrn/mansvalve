"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getPageAnalyticsContext, trackEvent } from "@/lib/analytics";

const ERROR_MS = 2200;
const TOAST_MS = 2000;

type CopyToClipboardProps = {
  value: string;
  children: ReactNode;
  /**
   * `default` — small copy icon + underlined value.
   * `minimal` — underlined value only.
   * Success feedback: fixed-position toast (see root `ToasterClient`), not inline.
   */
  variant?: "default" | "minimal";
  className?: string;
  kind?: "phone" | "email";
  "aria-label"?: string;
  title?: string;
  /** Shown in toast: `Скопировано: {messageForCopyToast}`. Defaults to `value`. */
  messageForCopyToast?: string;
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
 * Click copies `value` and shows a **toast** (bottom-right): «Скопировано: …».
 * No inline badges; layout in header/footer is unchanged.
 */
export function CopyToClipboard({
  value,
  children,
  variant = "default",
  className,
  kind,
  "aria-label": ariaLabel,
  title,
  messageForCopyToast,
}: CopyToClipboardProps) {
  const [errorFlash, setErrorFlash] = useState(false);
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

  const showSuccessToast = useCallback(() => {
    const display = (messageForCopyToast ?? value).trim();
    toast.success(`Скопировано: ${display}`, { duration: TOAST_MS });
  }, [messageForCopyToast, value]);

  const handleClick = useCallback(async () => {
    if (resetTimer.current) {
      clearTimeout(resetTimer.current);
      resetTimer.current = null;
    }
    const ok = await copyTextToClipboard(value);
    if (ok) {
      if (kind) runAnalytics();
      showSuccessToast();
    } else {
      setErrorFlash(true);
      toast.error("Не удалось скопировать", { duration: ERROR_MS });
      resetTimer.current = setTimeout(() => {
        setErrorFlash(false);
        resetTimer.current = null;
      }, ERROR_MS);
    }
  }, [value, kind, runAnalytics, showSuccessToast]);

  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  if (variant === "minimal") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "group min-w-0 max-w-full rounded-md text-left transition-colors",
          "inline-flex focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:outline-none",
          "cursor-pointer",
          errorFlash && "text-amber-800",
          className,
        )}
        title={defaultTitle}
        aria-label={defaultAria}
      >
        <span className="min-w-0 border-b border-dotted border-slate-300 group-hover:border-blue-500 group-hover:text-blue-800">
          {children}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "group inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-md text-left transition-colors",
        "cursor-pointer hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:outline-none",
        errorFlash && "text-amber-800",
        className,
      )}
      title={defaultTitle}
      aria-label={defaultAria}
    >
      <span className="inline-flex min-w-0 items-center gap-1.5">
        <Copy className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
        <span className="min-w-0 underline decoration-slate-300 decoration-dotted underline-offset-2 group-hover:decoration-blue-600">
          {children}
        </span>
      </span>
    </button>
  );
}
