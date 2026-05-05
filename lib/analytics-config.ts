export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "G-K08PEJC569";

export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID?.trim() || "";

export const GA_CONFIGURED = Boolean(GA_MEASUREMENT_ID);

export const GTM_CONFIGURED = Boolean(GTM_ID);
