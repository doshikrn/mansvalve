export const GOOGLE_TAG_ID =
  process.env.NEXT_PUBLIC_GOOGLE_TAG_ID?.trim() ||
  "AW-18163182394";

export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID?.trim() || "";

export const GOOGLE_TAG_CONFIGURED = Boolean(GOOGLE_TAG_ID);

export const GTM_CONFIGURED = Boolean(GTM_ID) && !GOOGLE_TAG_CONFIGURED;
