"use client";

import * as React from "react";
import { ChevronRight, Mail, Phone, Send } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { WhatsappIcon } from "@/components/icons/WhatsappIcon";
import { COMPANY, COMPANY_PHONE_HREF } from "@/lib/company";
import { getPageAnalyticsContext, trackEvent } from "@/lib/analytics";

type ButtonVariant = React.ComponentProps<typeof Button>["variant"];
type ButtonSize = React.ComponentProps<typeof Button>["size"];

export interface QuickContactSheetAnalytics {
  source?: string;
  product_slug?: string;
  product_name?: string;
  category?: string;
}

export interface QuickContactSheetProps {
  /** Existing WhatsApp deep link (built by callers via lib/company helpers). */
  whatsAppUrl: string;
  /** Existing `mailto:` link (built by callers via lib/company helpers). */
  emailUrl: string;
  /**
   * `#request-name` for an on-page scroll to the existing form, or a path with
   * hash (e.g. `/tovar/slug#request-name`) to navigate to the form on the PDP.
   */
  formTarget: string;
  analytics?: QuickContactSheetAnalytics;
  triggerClassName?: string;
  triggerVariant?: ButtonVariant;
  triggerSize?: ButtonSize;
  /** Trigger label/content (kept identical to the CTA it replaces). */
  children: React.ReactNode;
}

export function QuickContactSheet({
  whatsAppUrl,
  emailUrl,
  formTarget,
  analytics,
  triggerClassName,
  triggerVariant,
  triggerSize,
  children,
}: QuickContactSheetProps) {
  const [open, setOpen] = React.useState(false);
  const pendingFormFocusRef = React.useRef(false);

  const buildPayload = React.useCallback(() => {
    const ctx = getPageAnalyticsContext();
    return {
      source: analytics?.source,
      product_slug: analytics?.product_slug ?? ctx.product_slug,
      product_name: analytics?.product_name,
      category: analytics?.category ?? ctx.category,
    };
  }, [analytics]);

  const handleOpenChange = (next: boolean) => {
    if (next) trackEvent("contact_sheet_open", buildPayload());
    setOpen(next);
  };

  const handleWhatsApp = () => {
    // Navigation + `whatsapp_click` are handled by the existing GlobalClickTracker.
    trackEvent("contact_sheet_whatsapp", buildPayload());
    setOpen(false);
  };

  const handlePhone = () => {
    // Navigation + `phone_click` are handled by the existing GlobalClickTracker.
    trackEvent("contact_sheet_phone", buildPayload());
    setOpen(false);
  };

  const handleEmail = () => {
    // Navigation + `email_click` are handled by the existing GlobalClickTracker.
    trackEvent("contact_sheet_email", buildPayload());
    setOpen(false);
  };

  const handleForm = () => {
    trackEvent("contact_sheet_form", buildPayload());
    if (formTarget.startsWith("#")) {
      pendingFormFocusRef.current = true;
      setOpen(false);
    } else {
      setOpen(false);
      window.location.assign(formTarget);
    }
  };

  const focusFormField = () => {
    const el = document.getElementById(formTarget.replace(/^#/, ""));
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    (el as HTMLElement).focus({ preventScroll: true });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant={triggerVariant}
          size={triggerSize}
          className={triggerClassName}
        >
          {children}
        </Button>
      </DialogTrigger>

      <DialogContent
        aria-label="Способы быстрой связи"
        onCloseAutoFocus={(event) => {
          if (!pendingFormFocusRef.current) return;
          event.preventDefault();
          pendingFormFocusRef.current = false;
          focusFormField();
        }}
        className="top-auto bottom-0 left-0 max-w-full translate-x-0 translate-y-0 gap-3 rounded-b-none rounded-t-2xl bg-site-card p-5 text-site-ink sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:max-w-sm sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl"
      >
        <DialogTitle className="text-base font-bold text-site-ink">
          Как вам удобнее связаться?
        </DialogTitle>
        <DialogDescription className="text-sm text-site-muted">
          Ответим по наличию и цене и подготовим КП.
        </DialogDescription>

        <div className="mt-1 grid gap-2">
          <a
            href={whatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWhatsApp}
            aria-label="WhatsApp — быстрый ответ менеджера"
            className="group flex items-center gap-3 rounded-xl border border-site-border bg-site-bg p-3 transition-colors hover:border-site-whatsapp hover:bg-[#F0FAF4]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-site-whatsapp text-white">
              <WhatsappIcon className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-site-ink">WhatsApp</span>
              <span className="block text-xs text-site-muted">Быстрый ответ менеджера</span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-site-muted" aria-hidden />
          </a>

          <a
            href={COMPANY_PHONE_HREF}
            onClick={handlePhone}
            aria-label={`Позвонить: ${COMPANY.phoneDisplay}`}
            className="group flex items-center gap-3 rounded-xl border border-site-border bg-site-bg p-3 transition-colors hover:border-site-primary hover:bg-[#EFF6FF]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-site-primary/10 text-site-primary">
              <Phone className="h-5 w-5" strokeWidth={2} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-site-ink">Позвонить</span>
              <span className="block text-xs text-site-muted">Консультация по наличию и цене</span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-site-muted" aria-hidden />
          </a>

          <a
            href={emailUrl}
            onClick={handleEmail}
            aria-label="Отправить на почту — запросить цену и документы"
            className="group flex items-center gap-3 rounded-xl border border-site-border bg-site-bg p-3 transition-colors hover:border-site-primary hover:bg-[#EFF6FF]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-site-primary/10 text-site-primary">
              <Mail className="h-5 w-5" strokeWidth={2} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-site-ink">Отправить на почту</span>
              <span className="block text-xs text-site-muted">Запросить цену и документы</span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-site-muted" aria-hidden />
          </a>

          <button
            type="button"
            onClick={handleForm}
            aria-label="Оставить заявку — получить КП и предложение"
            className="group flex items-center gap-3 rounded-xl border border-site-border bg-site-bg p-3 text-left transition-colors hover:border-site-primary hover:bg-[#EFF6FF]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-site-primary/10 text-site-primary">
              <Send className="h-5 w-5" strokeWidth={2} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-site-ink">Оставить заявку</span>
              <span className="block text-xs text-site-muted">Получить КП и предложение</span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-site-muted" aria-hidden />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
