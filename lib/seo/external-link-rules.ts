export type ExternalLinkSkipReason =
  | "tel"
  | "mailto"
  | "whatsapp"
  | "gmail-compose"
  | "same-origin"
  | "relative";

export function classifyExternalHref(
  href: string,
  siteOrigin: string,
): { external: boolean; skipHttpCheck: boolean; reason?: ExternalLinkSkipReason } {
  const raw = href.trim();
  if (!raw || raw.startsWith("#") || raw.startsWith("javascript:")) {
    return { external: false, skipHttpCheck: true, reason: "relative" };
  }

  if (raw.startsWith("tel:")) {
    return { external: true, skipHttpCheck: true, reason: "tel" };
  }
  if (raw.startsWith("mailto:")) {
    return { external: true, skipHttpCheck: true, reason: "mailto" };
  }

  if (raw.startsWith("/")) {
    return { external: false, skipHttpCheck: true, reason: "relative" };
  }

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return { external: true, skipHttpCheck: false };
  }

  if (url.origin === siteOrigin) {
    return { external: false, skipHttpCheck: true, reason: "same-origin" };
  }

  if (isWhatsAppDeeplink(url)) {
    return { external: true, skipHttpCheck: true, reason: "whatsapp" };
  }

  if (isGmailComposeUrl(url)) {
    return { external: true, skipHttpCheck: true, reason: "gmail-compose" };
  }

  return { external: true, skipHttpCheck: false };
}

export function isGmailComposeUrl(url: URL): boolean {
  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  return host === "mail.google.com" && url.pathname.startsWith("/mail/");
}

export function isWhatsAppDeeplink(url: URL): boolean {
  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  return host === "wa.me" || host === "api.whatsapp.com" || host === "chat.whatsapp.com";
}

export function guessLinkSourceComponent(href: string): string {
  if (href.startsWith("tel:") || href.startsWith("mailto:")) return "company/contact";
  if (isWhatsAppDeeplinkSafe(href)) return "company/whatsapp";
  if (/instagram\.com/i.test(href)) return "header/social";
  if (/2gis\.|google\.com\/maps|goo\.gl\/maps/i.test(href)) return "company/map";
  if (/mail\.google\.com/i.test(href)) return "company/gmail-compose";
  if (/\.pdf($|\?)/i.test(href)) return "certificates/cms";
  if (/mansvalve-group\.kz/i.test(href)) return "internal";
  return "content/cms";
}

function isWhatsAppDeeplinkSafe(href: string): boolean {
  try {
    return isWhatsAppDeeplink(new URL(href));
  } catch {
    return /wa\.me|whatsapp\.com/i.test(href);
  }
}
