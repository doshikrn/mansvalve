import { z } from "zod";

const optionalUrlSchema = z.string().trim();

export const TRUST_PROOF_MAX_ITEMS = 12;

export const clientLogoItemSchema = z.object({
  companyName: z.string().trim().min(1).max(200),
  logoUrl: z.string().trim().min(1).max(2000),
  websiteUrl: optionalUrlSchema.max(2000).optional().default(""),
  sortOrder: z.number().int().min(0).max(9999),
  isActive: z.boolean(),
});

export const homeClientLogosSchema = z.object({
  title: z.string().trim().min(1).max(300),
  items: z.array(clientLogoItemSchema).max(TRUST_PROOF_MAX_ITEMS),
});

export type HomeClientLogosContent = z.infer<typeof homeClientLogosSchema>;

export const DEFAULT_HOME_CLIENT_LOGOS: HomeClientLogosContent = {
  title: "Нам доверяют",
  items: [],
};

export const trustCaseItemSchema = z.object({
  title: z.string().trim().min(1).max(300),
  industry: z.string().trim().max(200),
  suppliedProducts: z.string().trim().max(500),
  description: z.string().trim().max(2000),
  result: z.string().trim().max(1000).optional().default(""),
  imageUrl: z.string().trim().min(1).max(2000),
  sortOrder: z.number().int().min(0).max(9999),
  isActive: z.boolean(),
});

export const homeTrustCasesSchema = z.object({
  title: z.string().trim().min(1).max(300),
  subtitle: z.string().trim().max(500).optional().default(""),
  items: z.array(trustCaseItemSchema).max(TRUST_PROOF_MAX_ITEMS),
});

export type HomeTrustCasesContent = z.infer<typeof homeTrustCasesSchema>;

export const DEFAULT_HOME_TRUST_CASES: HomeTrustCasesContent = {
  title: "Реальные кейсы поставок",
  subtitle: "",
  items: [],
};

export const testimonialItemSchema = z.object({
  quote: z.string().trim().min(1).max(2000),
  authorName: z.string().trim().max(200).optional().default(""),
  authorPosition: z.string().trim().max(200).optional().default(""),
  companyName: z.string().trim().min(1).max(200),
  companyLogoUrl: optionalUrlSchema.max(2000).optional().default(""),
  sortOrder: z.number().int().min(0).max(9999),
  isActive: z.boolean(),
});

export const homeTestimonialsSchema = z.object({
  title: z.string().trim().min(1).max(300),
  items: z.array(testimonialItemSchema).max(TRUST_PROOF_MAX_ITEMS),
});

export type HomeTestimonialsContent = z.infer<typeof homeTestimonialsSchema>;

export const DEFAULT_HOME_TESTIMONIALS: HomeTestimonialsContent = {
  title: "Отзывы клиентов",
  items: [],
};

export const thankYouLetterItemSchema = z.object({
  title: z.string().trim().min(1).max(300),
  companyName: z.string().trim().min(1).max(200),
  previewImageUrl: z.string().trim().min(1).max(2000),
  documentUrl: z.string().trim().min(1).max(2000),
  sortOrder: z.number().int().min(0).max(9999),
  isActive: z.boolean(),
});

export const homeThankYouLettersSchema = z.object({
  title: z.string().trim().min(1).max(300),
  items: z.array(thankYouLetterItemSchema).max(TRUST_PROOF_MAX_ITEMS),
});

export type HomeThankYouLettersContent = z.infer<typeof homeThankYouLettersSchema>;

export const DEFAULT_HOME_THANK_YOU_LETTERS: HomeThankYouLettersContent = {
  title: "Благодарственные письма",
  items: [],
};

export const homeCertificatesPreviewSchema = z.object({
  title: z.string().trim().min(1).max(300),
  subtitle: z.string().trim().max(500).optional().default(""),
  /** Сколько активных сертификатов показать на главной (3–5). */
  limit: z.number().int().min(3).max(5),
});

export type HomeCertificatesPreviewContent = z.infer<typeof homeCertificatesPreviewSchema>;

export const DEFAULT_HOME_CERTIFICATES_PREVIEW: HomeCertificatesPreviewContent = {
  title: "Сертификаты и документы",
  subtitle: "",
  limit: 4,
};

function shallowMerge<T extends Record<string, unknown>>(base: T, patch: unknown): T {
  if (!patch || typeof patch !== "object") return base;
  return { ...base, ...(patch as Record<string, unknown>) };
}

function mergeTrustBlock<T extends { items: unknown[] }>(
  defaults: T,
  schema: z.ZodType<T>,
  dbJson: unknown,
): T {
  const merged = shallowMerge(defaults as unknown as Record<string, unknown>, dbJson);
  const parsed = schema.safeParse(merged);
  return parsed.success ? parsed.data : defaults;
}

export function mergeHomeClientLogos(dbJson: unknown): HomeClientLogosContent {
  return mergeTrustBlock(DEFAULT_HOME_CLIENT_LOGOS, homeClientLogosSchema, dbJson);
}

export function mergeHomeTrustCases(dbJson: unknown): HomeTrustCasesContent {
  return mergeTrustBlock(DEFAULT_HOME_TRUST_CASES, homeTrustCasesSchema, dbJson);
}

export function mergeHomeTestimonials(dbJson: unknown): HomeTestimonialsContent {
  return mergeTrustBlock(DEFAULT_HOME_TESTIMONIALS, homeTestimonialsSchema, dbJson);
}

export function mergeHomeThankYouLetters(dbJson: unknown): HomeThankYouLettersContent {
  return mergeTrustBlock(DEFAULT_HOME_THANK_YOU_LETTERS, homeThankYouLettersSchema, dbJson);
}

export function mergeHomeCertificatesPreview(dbJson: unknown): HomeCertificatesPreviewContent {
  const merged = shallowMerge(
    DEFAULT_HOME_CERTIFICATES_PREVIEW as unknown as Record<string, unknown>,
    dbJson,
  );
  const parsed = homeCertificatesPreviewSchema.safeParse(merged);
  return parsed.success ? parsed.data : DEFAULT_HOME_CERTIFICATES_PREVIEW;
}

export function getActiveTrustItems<T extends { isActive: boolean; sortOrder: number }>(
  items: T[],
): T[] {
  return items
    .filter((item) => item.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder || 0);
}

export function hasActiveTrustItems<T extends { isActive: boolean }>(
  items: T[],
  isComplete: (item: T) => boolean,
): boolean {
  return items.some((item) => item.isActive && isComplete(item));
}
