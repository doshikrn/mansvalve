"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { getPageAnalyticsContext, trackEvent } from "@/lib/analytics";

const WHATSAPP_PATTERN = /wa\.me|api\.whatsapp\.com|whatsapp/i;

function navigateAfterConversion(href: string) {
  window.location.href = href;
}

export function GlobalClickTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;

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
        product_slug: pageContext.product_slug,
        category: pageContext.category,
        href,
        link_text: link.textContent?.trim() || undefined,
      };

      if (href.startsWith("tel:")) {
        event.preventDefault();
        trackEvent("phone_click", basePayload, {
          conversionCallback: () => navigateAfterConversion(href),
        });
        return;
      }

      if (href.startsWith("mailto:") || href.includes("mail.google.com/mail/")) {
        trackEvent("email_click", basePayload);
        return;
      }

      if (WHATSAPP_PATTERN.test(href)) {
        event.preventDefault();
        trackEvent("whatsapp_click", basePayload, {
          conversionCallback: () => navigateAfterConversion(href),
        });
        return;
      }

    };

    document.addEventListener("click", onDocumentClick);
    return () => {
      document.removeEventListener("click", onDocumentClick);
    };
  }, [pathname]);

  return null;
}
