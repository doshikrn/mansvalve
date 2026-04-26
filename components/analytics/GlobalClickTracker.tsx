"use client";

import { useEffect } from "react";

import { getPageAnalyticsContext, trackEvent } from "@/lib/analytics";

const WHATSAPP_PATTERN = /wa\.me|api\.whatsapp\.com|whatsapp/i;

export function GlobalClickTracker() {
  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const link = target.closest("a");
      if (!link) return;

      const href = link.getAttribute("href")?.trim();
      if (!href) return;

      const pageContext = getPageAnalyticsContext(window.location.pathname);
      const basePayload = {
        source: "link",
        page: pageContext.page,
        product_slug: pageContext.product_slug,
        category: pageContext.category,
        href,
        link_text: link.textContent?.trim() || undefined,
      };

      if (href.startsWith("tel:")) {
        trackEvent("phone_click", basePayload);
        return;
      }

      if (WHATSAPP_PATTERN.test(href)) {
        trackEvent("whatsapp_click", basePayload);
      }
    };

    document.addEventListener("click", onDocumentClick);
    return () => {
      document.removeEventListener("click", onDocumentClick);
    };
  }, []);

  return null;
}
