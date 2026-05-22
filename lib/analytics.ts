import { GA_CONFIGURED, GA_MEASUREMENT_ID, GTM_CONFIGURED } from "@/lib/analytics-config";

type AnalyticsValue = string | number | boolean | null | undefined;

export type AnalyticsPayload = Record<string, AnalyticsValue>;
const SESSION_STORAGE_KEY = "mansvalve:analytics-session-id";
const URL_ATTRIBUTION_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "yclid",
  "fbclid",
] as const;

export interface PageAnalyticsContext {
  page: string;
  product_slug?: string;
  category?: string;
}

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (
      command: "config" | "event" | "js",
      targetIdOrEventName: string | Date,
      config?: Record<string, unknown>,
    ) => void;
  }
}

function normalizePayload(payload: AnalyticsPayload): Record<string, string | number | boolean | null> {
  const normalized: Record<string, string | number | boolean | null> = {};

  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined) continue;
    normalized[key] = typeof value === "string" ? value.trim() : value;
  }

  return normalized;
}

function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function getSessionId(): string {
  try {
    const existing = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (existing) return existing;

    const generated = createId();
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, generated);
    return generated;
  } catch {
    // Fallback when storage is unavailable.
    return createId();
  }
}

export function getPageAnalyticsContext(pathname?: string): PageAnalyticsContext {
  const page = pathname ?? (typeof window !== "undefined" ? window.location.pathname : "/");
  const categoryMatch = page.match(/^\/catalog\/category\/([^/?#]+)/);
  const catalogNestedProduct = page.match(/^\/catalog\/([^/]+)\/([^/]+)\/([^/?#]+)$/);
  const catalogSubcategoryOnly = page.match(/^\/catalog\/([^/]+)\/([^/?#]+)$/);
  const tovarMatch = page.match(/^\/tovar\/([^/?#]+)$/);
  const zadvizhkiMatch = page.match(/^\/zadvizhki\/([^/?#]+)$/);
  const catalogCategoryShort = page.match(/^\/catalog\/([^/?#]+)$/);
  const shortSeg = catalogCategoryShort?.[1];
  const isReservedShortSegment =
    shortSeg === "category" || shortSeg === "subcategory" || shortSeg === undefined;

  return {
    page,
    category:
      categoryMatch?.[1] ??
      catalogNestedProduct?.[1] ??
      catalogSubcategoryOnly?.[1] ??
      (!isReservedShortSegment ? shortSeg : undefined),
    product_slug:
      tovarMatch?.[1] ??
      zadvizhkiMatch?.[1] ??
      catalogNestedProduct?.[3],
  };
}

/**
 * Base fields for every dataLayer event (URL-derived). Callers may override with
 * a more specific `product_slug` / `category` (e.g. from product form context).
 */
function getDefaultDataLayerContext(): AnalyticsPayload {
  if (typeof window === "undefined") return {};
  const pathname = window.location.pathname;
  const page = `${pathname}${window.location.search || ""}`;
  const { product_slug, category } = getPageAnalyticsContext(pathname);
  const searchParams = new URLSearchParams(window.location.search);
  const out: AnalyticsPayload = {
    page,
    pathname,
    page_path: pathname,
    page_location: window.location.href,
  };
  for (const key of URL_ATTRIBUTION_KEYS) {
    const value = searchParams.get(key)?.trim();
    if (value) out[key] = value;
  }
  if (product_slug) out.product_slug = product_slug;
  if (category) out.category = category;
  return out;
}

/**
 * Pushes a single custom event to analytics transports.
 * GTM receives dataLayer events; direct GA4 receives the same events through gtag.
 */
export function trackEvent(eventName: string, payload: AnalyticsPayload = {}) {
  if (typeof window === "undefined") return;
  if (!GTM_CONFIGURED && !GA_CONFIGURED) return;

  const defaults = getDefaultDataLayerContext();
  const merged: AnalyticsPayload = { ...defaults, ...payload };
  const normalizedPayload = normalizePayload(merged);
  const analyticsPayload = {
    ...normalizedPayload,
    session_id: getSessionId(),
    event_id: createId(),
  };

  window.setTimeout(() => {
    try {
      window.dataLayer = window.dataLayer || [];
      // When GTM is enabled, custom events should go through `dataLayer` only — pushing the same
      // event to both `dataLayer` and `gtag` doubles counts if the container also forwards to GA4.
      if (GTM_CONFIGURED) {
        window.dataLayer.push({
          event: eventName,
          ...analyticsPayload,
        });
        return;
      }
      if (GA_CONFIGURED && typeof window.gtag === "function") {
        window.gtag("event", eventName, {
          ...analyticsPayload,
          send_to: GA_MEASUREMENT_ID,
        });
      }
    } catch {
      // Ignore analytics transport errors.
    }
  }, 0);
}
