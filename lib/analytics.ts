type AnalyticsValue = string | number | boolean | null | undefined;

export type AnalyticsPayload = Record<string, AnalyticsValue>;
const SESSION_STORAGE_KEY = "mansvalve:analytics-session-id";

export interface PageAnalyticsContext {
  page: string;
  product_slug?: string;
  category?: string;
}

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
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
  const productMatch = page.match(/^\/catalog\/([^/?#]+)$/);

  return {
    page,
    category: categoryMatch?.[1],
    product_slug: productMatch?.[1],
  };
}

const GTM_CONFIGURED = Boolean(process.env.NEXT_PUBLIC_GTM_ID?.trim());

export function trackEvent(eventName: string, payload: AnalyticsPayload = {}) {
  if (typeof window === "undefined") return;
  if (!GTM_CONFIGURED) return;

  const normalizedPayload = normalizePayload(payload);
  const analyticsPayload = {
    ...normalizedPayload,
    session_id: getSessionId(),
    event_id: createId(),
  };

  window.setTimeout(() => {
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: eventName,
        ...analyticsPayload,
      });
    } catch {
      // Ignore analytics transport errors.
    }

    try {
      if (typeof window.gtag === "function") {
        window.gtag("event", eventName, analyticsPayload);
      }
    } catch {
      // Ignore analytics transport errors.
    }
  }, 0);
}
