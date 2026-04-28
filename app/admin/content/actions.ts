"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/current-user";
import { SITE_CONTENT_KEYS } from "@/lib/site-content/keys";
import {
  aboutCopySchema,
  contactsCopySchema,
  pageMetaSchema,
  homeFaqSchema,
  homeHeroPersistSchema,
  homeMetaSchema,
  homeProductShowcasesSchema,
  requestCtaSchema,
  trustStripSchema,
} from "@/lib/site-content/models";
import { upsertContentBlock } from "@/lib/services/content-blocks";

function err(msg: string) {
  redirect(`/admin/content?error=${encodeURIComponent(msg)}`);
}

function parseSlugList(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function saveHomeHeroAction(formData: FormData) {
  const session = await requireAdmin("/admin/content");
  const trustPoints = [
    String(formData.get("trust_0") ?? "").trim(),
    String(formData.get("trust_1") ?? "").trim(),
    String(formData.get("trust_2") ?? "").trim(),
    String(formData.get("trust_3") ?? "").trim(),
  ].filter(Boolean);
  if (trustPoints.length < 1) err("Нужен хотя бы один пункт доверия в герое.");

  const data = {
    eyebrow: String(formData.get("eyebrow") ?? "").trim(),
    h1Line1: String(formData.get("h1Line1") ?? "").trim(),
    h1Highlight: String(formData.get("h1Highlight") ?? "").trim(),
    subhead: String(formData.get("subhead") ?? "").trim(),
    primaryCta: String(formData.get("primaryCta") ?? "").trim(),
    secondaryCta: String(formData.get("secondaryCta") ?? "").trim(),
    trustPoints,
    stat1Val: String(formData.get("stat1Val") ?? "").trim(),
    stat1Label: String(formData.get("stat1Label") ?? "").trim(),
    stat2Label: String(formData.get("stat2Label") ?? "").trim(),
    stat3Val: String(formData.get("stat3Val") ?? "").trim(),
    stat3Label: String(formData.get("stat3Label") ?? "").trim(),
    featuredEyebrow: String(formData.get("featuredEyebrow") ?? "").trim(),
    featuredTitle: String(formData.get("featuredTitle") ?? "").trim(),
    featuredLinkTemplate: String(formData.get("featuredLinkTemplate") ?? "").trim(),
  };

  const parsed = homeHeroPersistSchema.safeParse(data);
  if (!parsed.success) {
    err(parsed.error.issues.map((e) => e.message).join("; "));
  }

  await upsertContentBlock({
    key: SITE_CONTENT_KEYS.homeHero,
    title: "Главная — герой",
    data: parsed.data as unknown as Record<string, unknown>,
    updatedBy: Number(session.sub) || null,
  });

  revalidatePath("/");
  revalidatePath("/admin/content");
  redirect("/admin/content?saved=hero");
}

export async function saveTrustStripAction(formData: FormData) {
  const session = await requireAdmin("/admin/content");
  const data = {
    paragraph: String(formData.get("paragraph") ?? "").trim(),
  };
  const parsed = trustStripSchema.safeParse(data);
  if (!parsed.success) err("Текст доверия: проверьте поле.");
  await upsertContentBlock({
    key: SITE_CONTENT_KEYS.homeTrustStrip,
    title: "Главная — полоса доверия",
    data: parsed.data as unknown as Record<string, unknown>,
    updatedBy: Number(session.sub) || null,
  });
  revalidatePath("/");
  redirect("/admin/content?saved=trust");
}

export async function saveHomeProductShowcasesAction(formData: FormData) {
  const session = await requireAdmin("/admin/content");
  const data = {
    heroProductSlugs: parseSlugList(formData.get("heroProductSlugs")),
    catalogHitSlugs: parseSlugList(formData.get("catalogHitSlugs")),
  };

  const parsed = homeProductShowcasesSchema.safeParse(data);
  if (!parsed.success) {
    err("Популярные товары: укажите от 1 до 12 slug в каждом списке.");
  }

  await upsertContentBlock({
    key: SITE_CONTENT_KEYS.homeProductShowcases,
    title: "Главная — популярные товары",
    data: parsed.data as unknown as Record<string, unknown>,
    updatedBy: Number(session.sub) || null,
  });

  revalidatePath("/");
  revalidatePath("/admin/content");
  redirect("/admin/content?saved=product-showcases");
}

export async function saveRequestCtaAction(formData: FormData) {
  const session = await requireAdmin("/admin/content");
  const data = {
    title: String(formData.get("title") ?? "").trim(),
    subtitle: String(formData.get("subtitle") ?? "").trim(),
    footerHint: String(formData.get("footerHint") ?? "").trim(),
  };
  const parsed = requestCtaSchema.safeParse(data);
  if (!parsed.success) err("CTA: проверьте поля.");
  await upsertContentBlock({
    key: SITE_CONTENT_KEYS.homeRequestCta,
    title: "Главная — заявка",
    data: parsed.data as unknown as Record<string, unknown>,
    updatedBy: Number(session.sub) || null,
  });
  revalidatePath("/");
  redirect("/admin/content?saved=rcta");
}

export async function saveHomeFaqAction(formData: FormData) {
  const session = await requireAdmin("/admin/content");
  const items: { q: string; a: string }[] = [];
  for (let i = 0; i < 8; i++) {
    const q = String(formData.get(`faq_q_${i}`) ?? "").trim();
    const a = String(formData.get(`faq_a_${i}`) ?? "").trim();
    if (q && a) items.push({ q, a });
  }
  if (items.length < 1) err("Нужен хотя бы один вопрос FAQ.");

  const data = {
    sectionEyebrow: String(formData.get("sectionEyebrow") ?? "").trim(),
    sectionTitle: String(formData.get("sectionTitle") ?? "").trim(),
    items,
  };
  const parsed = homeFaqSchema.safeParse(data);
  if (!parsed.success) err("FAQ: проверьте поля.");
  await upsertContentBlock({
    key: SITE_CONTENT_KEYS.homeFaq,
    title: "Главная — FAQ",
    data: parsed.data as unknown as Record<string, unknown>,
    updatedBy: Number(session.sub) || null,
  });
  revalidatePath("/");
  redirect("/admin/content?saved=faq");
}

export async function saveHomeMetaAction(formData: FormData) {
  const session = await requireAdmin("/admin/content");
  const data = {
    ogTitle: String(formData.get("ogTitle") ?? "").trim(),
    ogDescription: String(formData.get("ogDescription") ?? "").trim(),
  };
  const parsed = homeMetaSchema.safeParse(data);
  if (!parsed.success) err("Meta главной: проверьте поля.");
  await upsertContentBlock({
    key: SITE_CONTENT_KEYS.homeMeta,
    title: "Meta — главная",
    data: parsed.data as unknown as Record<string, unknown>,
    updatedBy: Number(session.sub) || null,
  });
  revalidatePath("/");
  redirect("/admin/content?saved=meta");
}

export async function saveAboutCopyAction(formData: FormData) {
  const session = await requireAdmin("/admin/content");
  const overviewRaw = String(formData.get("overview") ?? "");
  const overviewParagraphs = overviewRaw
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (overviewParagraphs.length < 1) {
    err("О компании: добавьте текст блока «Кто мы» (абзацы через пустую строку).");
  }

  const data = {
    headerLead: String(formData.get("headerLead") ?? "").trim(),
    overviewParagraphs,
    productGroupsLine: String(formData.get("productGroupsLine") ?? "").trim(),
    ctaTitle: String(formData.get("ctaTitle") ?? "").trim(),
    ctaSubtitle: String(formData.get("ctaSubtitle") ?? "").trim(),
  };
  const parsed = aboutCopySchema.safeParse(data);
  if (!parsed.success) err("О компании: проверьте поля.");
  await upsertContentBlock({
    key: SITE_CONTENT_KEYS.aboutCopy,
    title: "О компании — тексты",
    data: parsed.data as unknown as Record<string, unknown>,
    updatedBy: Number(session.sub) || null,
  });
  revalidatePath("/about");
  redirect("/admin/content?saved=about");
}

export async function saveAboutMetaAction(formData: FormData) {
  const session = await requireAdmin("/admin/content");
  const data = {
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
  };
  const parsed = pageMetaSchema.safeParse(data);
  if (!parsed.success) err("Meta страницы «О компании»: проверьте поля.");
  await upsertContentBlock({
    key: SITE_CONTENT_KEYS.aboutMeta,
    title: "Meta — О компании",
    data: parsed.data as unknown as Record<string, unknown>,
    updatedBy: Number(session.sub) || null,
  });
  revalidatePath("/about");
  redirect("/admin/content?saved=about-meta");
}

export async function saveContactsCopyAction(formData: FormData) {
  const session = await requireAdmin("/admin/content");
  const data = {
    pageLead: String(formData.get("pageLead") ?? "").trim(),
    formTitle: String(formData.get("formTitle") ?? "").trim(),
    formHelper: String(formData.get("formHelper") ?? "").trim(),
  };
  const parsed = contactsCopySchema.safeParse(data);
  if (!parsed.success) err("Контакты: проверьте поля.");
  await upsertContentBlock({
    key: SITE_CONTENT_KEYS.contactsCopy,
    title: "Контакты — тексты",
    data: parsed.data as unknown as Record<string, unknown>,
    updatedBy: Number(session.sub) || null,
  });
  revalidatePath("/contacts");
  redirect("/admin/content?saved=contacts");
}

export async function saveContactsMetaAction(formData: FormData) {
  const session = await requireAdmin("/admin/content");
  const data = {
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
  };
  const parsed = pageMetaSchema.safeParse(data);
  if (!parsed.success) err("Meta страницы «Контакты»: проверьте поля.");
  await upsertContentBlock({
    key: SITE_CONTENT_KEYS.contactsMeta,
    title: "Meta — Контакты",
    data: parsed.data as unknown as Record<string, unknown>,
    updatedBy: Number(session.sub) || null,
  });
  revalidatePath("/contacts");
  redirect("/admin/content?saved=contacts-meta");
}
