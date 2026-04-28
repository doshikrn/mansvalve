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
  headerTopNavSchema,
  homeCategoriesSchema,
  homeWhyUsSchema,
  homeHowItWorksSchema,
  homeWhoWeSupplySchema,
  homeDeliveryCaseSchema,
  footerPreCtaSchema,
  footerTrustBarSchema,
  footerMainSchema,
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
    stat2MarketingVal: String(formData.get("stat2MarketingVal") ?? "").trim(),
    stat3Val: String(formData.get("stat3Val") ?? "").trim(),
    stat3Label: String(formData.get("stat3Label") ?? "").trim(),
    featuredEyebrow: String(formData.get("featuredEyebrow") ?? "").trim(),
    featuredTitle: String(formData.get("featuredTitle") ?? "").trim(),
    featuredLinkTemplate: String(formData.get("featuredLinkTemplate") ?? "").trim(),
    kpWhatsAppMessage: String(formData.get("kpWhatsAppMessage") ?? "").trim(),
    heroShowcaseRibbonLabel: String(formData.get("heroShowcaseRibbonLabel") ?? "").trim(),
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

function parsePipeLinkLines(raw: string): { label: string; href: string }[] {
  const out: { label: string; href: string }[] = [];
  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim();
    if (!t) continue;
    const pipe = t.indexOf("|");
    if (pipe < 1) continue;
    const label = t.slice(0, pipe).trim();
    const href = t.slice(pipe + 1).trim();
    if (label && href) out.push({ label, href });
  }
  return out;
}

export async function saveHeaderTopNavAction(formData: FormData) {
  const session = await requireAdmin("/admin/content");
  const links = parsePipeLinkLines(String(formData.get("links") ?? ""));
  const parsed = headerTopNavSchema.safeParse({ links });
  if (!parsed.success) err("Шапка: строки вида «Подпись|/путь», минимум одна.");
  await upsertContentBlock({
    key: SITE_CONTENT_KEYS.headerTopNav,
    title: "Шапка — верхнее меню",
    data: parsed.data as unknown as Record<string, unknown>,
    updatedBy: Number(session.sub) || null,
  });
  revalidatePath("/", "layout");
  redirect("/admin/content?saved=header-nav");
}

export async function saveHomeCategoriesAction(formData: FormData) {
  const session = await requireAdmin("/admin/content");
  const data = {
    sectionEyebrow: String(formData.get("sectionEyebrow") ?? "").trim(),
    sectionTitle: String(formData.get("sectionTitle") ?? "").trim(),
    sectionLead: String(formData.get("sectionLead") ?? "").trim(),
    sectionCtaLabel: String(formData.get("sectionCtaLabel") ?? "").trim(),
    sectionCtaHref: String(formData.get("sectionCtaHref") ?? "").trim(),
    carouselEyebrow: String(formData.get("carouselEyebrow") ?? "").trim(),
    carouselTitle: String(formData.get("carouselTitle") ?? "").trim(),
    carouselLinkLabel: String(formData.get("carouselLinkLabel") ?? "").trim(),
    carouselLinkHref: String(formData.get("carouselLinkHref") ?? "").trim(),
    carouselBadgeLabel: String(formData.get("carouselBadgeLabel") ?? "").trim(),
  };
  const parsed = homeCategoriesSchema.safeParse(data);
  if (!parsed.success) err("Главная — блок каталога: проверьте поля.");
  await upsertContentBlock({
    key: SITE_CONTENT_KEYS.homeCategories,
    title: "Главная — хиты каталога",
    data: parsed.data as unknown as Record<string, unknown>,
    updatedBy: Number(session.sub) || null,
  });
  revalidatePath("/");
  redirect("/admin/content?saved=home-categories");
}

export async function saveHomeWhyUsAction(formData: FormData) {
  const session = await requireAdmin("/admin/content");
  const items: { metric: string; title: string; desc: string }[] = [];
  for (let i = 0; i < 8; i++) {
    const metric = String(formData.get(`metric_${i}`) ?? "").trim();
    const title = String(formData.get(`title_${i}`) ?? "").trim();
    const desc = String(formData.get(`desc_${i}`) ?? "").trim();
    if (metric && title && desc) items.push({ metric, title, desc });
  }
  const data = {
    sectionEyebrow: String(formData.get("sectionEyebrow") ?? "").trim(),
    sectionTitle: String(formData.get("sectionTitle") ?? "").trim(),
    items,
  };
  const parsed = homeWhyUsSchema.safeParse(data);
  if (!parsed.success) err("Преимущества: нужен хотя бы один полный блок (метрика, заголовок, текст).");
  await upsertContentBlock({
    key: SITE_CONTENT_KEYS.homeWhyUs,
    title: "Главная — преимущества",
    data: parsed.data as unknown as Record<string, unknown>,
    updatedBy: Number(session.sub) || null,
  });
  revalidatePath("/");
  redirect("/admin/content?saved=home-why-us");
}

export async function saveHomeHowItWorksAction(formData: FormData) {
  const session = await requireAdmin("/admin/content");
  const steps: { num: string; title: string; desc: string }[] = [];
  for (let i = 0; i < 8; i++) {
    const num = String(formData.get(`step_num_${i}`) ?? "").trim();
    const title = String(formData.get(`step_title_${i}`) ?? "").trim();
    const desc = String(formData.get(`step_desc_${i}`) ?? "").trim();
    if (num && title && desc) steps.push({ num, title, desc });
  }
  const data = {
    sectionEyebrow: String(formData.get("sectionEyebrow") ?? "").trim(),
    sectionTitle: String(formData.get("sectionTitle") ?? "").trim(),
    steps,
  };
  const parsed = homeHowItWorksSchema.safeParse(data);
  if (!parsed.success) err("«Как мы работаем»: нужен хотя бы один шаг.");
  await upsertContentBlock({
    key: SITE_CONTENT_KEYS.homeHowItWorks,
    title: "Главная — как мы работаем",
    data: parsed.data as unknown as Record<string, unknown>,
    updatedBy: Number(session.sub) || null,
  });
  revalidatePath("/");
  redirect("/admin/content?saved=home-how-it-works");
}

export async function saveHomeWhoWeSupplyAction(formData: FormData) {
  const session = await requireAdmin("/admin/content");
  const segments: { title: string; text: string }[] = [];
  for (let i = 0; i < 8; i++) {
    const title = String(formData.get(`seg_title_${i}`) ?? "").trim();
    const text = String(formData.get(`seg_text_${i}`) ?? "").trim();
    if (title && text) segments.push({ title, text });
  }
  const data = {
    sectionEyebrow: String(formData.get("sectionEyebrow") ?? "").trim(),
    sectionTitle: String(formData.get("sectionTitle") ?? "").trim(),
    sectionLead: String(formData.get("sectionLead") ?? "").trim(),
    segments,
  };
  const parsed = homeWhoWeSupplySchema.safeParse(data);
  if (!parsed.success) err("«Кому поставляем»: нужен хотя бы один сегмент.");
  await upsertContentBlock({
    key: SITE_CONTENT_KEYS.homeWhoWeSupply,
    title: "Главная — кому поставляем",
    data: parsed.data as unknown as Record<string, unknown>,
    updatedBy: Number(session.sub) || null,
  });
  revalidatePath("/");
  redirect("/admin/content?saved=home-who-we-supply");
}

export async function saveHomeDeliveryCaseAction(formData: FormData) {
  const session = await requireAdmin("/admin/content");
  const cases: {
    title: string;
    text: string;
    positions: string;
    term: string;
    termLabel: string;
    object: string;
    result: string;
  }[] = [];
  for (let i = 0; i < 12; i++) {
    const title = String(formData.get(`case_title_${i}`) ?? "").trim();
    if (!title) continue;
    cases.push({
      title,
      text: String(formData.get(`case_text_${i}`) ?? "").trim(),
      positions: String(formData.get(`case_positions_${i}`) ?? "").trim(),
      term: String(formData.get(`case_term_${i}`) ?? "").trim(),
      termLabel: String(formData.get(`case_termLabel_${i}`) ?? "").trim(),
      object: String(formData.get(`case_object_${i}`) ?? "").trim(),
      result: String(formData.get(`case_result_${i}`) ?? "").trim(),
    });
  }
  const data = {
    sectionEyebrow: String(formData.get("sectionEyebrow") ?? "").trim(),
    sectionTitle: String(formData.get("sectionTitle") ?? "").trim(),
    sectionLead: String(formData.get("sectionLead") ?? "").trim(),
    kitMetaLabel: String(formData.get("kitMetaLabel") ?? "").trim(),
    objectMetaLabel: String(formData.get("objectMetaLabel") ?? "").trim(),
    resultPrefix: String(formData.get("resultPrefix") ?? "").trim(),
    summaryCasesValue: String(formData.get("summaryCasesValue") ?? "").trim(),
    summaryCasesLabel: String(formData.get("summaryCasesLabel") ?? "").trim(),
    summaryDaysValue: String(formData.get("summaryDaysValue") ?? "").trim(),
    summaryDaysLabel: String(formData.get("summaryDaysLabel") ?? "").trim(),
    summaryUnitsValue: String(formData.get("summaryUnitsValue") ?? "").trim(),
    summaryUnitsLabel: String(formData.get("summaryUnitsLabel") ?? "").trim(),
    cases,
  };
  const parsed = homeDeliveryCaseSchema.safeParse(data);
  if (!parsed.success) err("Кейсы: нужен хотя бы один кейс с заголовком.");
  await upsertContentBlock({
    key: SITE_CONTENT_KEYS.homeDeliveryCase,
    title: "Главная — кейсы",
    data: parsed.data as unknown as Record<string, unknown>,
    updatedBy: Number(session.sub) || null,
  });
  revalidatePath("/");
  redirect("/admin/content?saved=home-delivery-case");
}

export async function saveFooterPreCtaAction(formData: FormData) {
  const session = await requireAdmin("/admin/content");
  const data = {
    title: String(formData.get("title") ?? "").trim(),
    subtitle: String(formData.get("subtitle") ?? "").trim(),
    whatsappPrimary: String(formData.get("whatsappPrimary") ?? "").trim(),
    whatsappSecondary: String(formData.get("whatsappSecondary") ?? "").trim(),
    emailPrimary: String(formData.get("emailPrimary") ?? "").trim(),
    emailSecondary: String(formData.get("emailSecondary") ?? "").trim(),
    kpWhatsAppMessage: String(formData.get("kpWhatsAppMessage") ?? "").trim(),
  };
  const parsed = footerPreCtaSchema.safeParse(data);
  if (!parsed.success) err("Footer — pre-CTA: проверьте поля.");
  await upsertContentBlock({
    key: SITE_CONTENT_KEYS.footerPreCta,
    title: "Подвал — призыв перед футером",
    data: parsed.data as unknown as Record<string, unknown>,
    updatedBy: Number(session.sub) || null,
  });
  revalidatePath("/", "layout");
  redirect("/admin/content?saved=footer-pre-cta");
}

export async function saveFooterTrustBarAction(formData: FormData) {
  const session = await requireAdmin("/admin/content");
  const raw = String(formData.get("items") ?? "");
  const items = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const parsed = footerTrustBarSchema.safeParse({ items });
  if (!parsed.success) err("Footer — полоса доверия: нужна хотя бы одна строка.");
  await upsertContentBlock({
    key: SITE_CONTENT_KEYS.footerTrustBar,
    title: "Подвал — полоса доверия",
    data: parsed.data as unknown as Record<string, unknown>,
    updatedBy: Number(session.sub) || null,
  });
  revalidatePath("/", "layout");
  redirect("/admin/content?saved=footer-trust");
}

export async function saveFooterMainAction(formData: FormData) {
  const session = await requireAdmin("/admin/content");
  const catalogLinks = parsePipeLinkLines(String(formData.get("catalogLinks") ?? ""));
  const companyLinks = parsePipeLinkLines(String(formData.get("companyLinks") ?? ""));
  const data = {
    brandTagline: String(formData.get("brandTagline") ?? "").trim(),
    brandLogoSrc: String(formData.get("brandLogoSrc") ?? "").trim(),
    legalNameLine: String(formData.get("legalNameLine") ?? "").trim(),
    addressLine: String(formData.get("addressLine") ?? "").trim(),
    workHoursLine: String(formData.get("workHoursLine") ?? "").trim(),
    catalogHeading: String(formData.get("catalogHeading") ?? "").trim(),
    companyHeading: String(formData.get("companyHeading") ?? "").trim(),
    contactHeading: String(formData.get("contactHeading") ?? "").trim(),
    whatsappButtonLabel: String(formData.get("whatsappButtonLabel") ?? "").trim(),
    bottomCopyright: String(formData.get("bottomCopyright") ?? "").trim(),
    bottomTagline: String(formData.get("bottomTagline") ?? "").trim(),
    termsLabel: String(formData.get("termsLabel") ?? "").trim(),
    privacyLabel: String(formData.get("privacyLabel") ?? "").trim(),
    catalogLinks,
    companyLinks,
  };
  const parsed = footerMainSchema.safeParse(data);
  if (!parsed.success) err("Подвал — основной блок: проверьте ссылки (формат «Подпись|/путь»).");
  await upsertContentBlock({
    key: SITE_CONTENT_KEYS.footerMain,
    title: "Подвал — основной блок",
    data: parsed.data as unknown as Record<string, unknown>,
    updatedBy: Number(session.sub) || null,
  });
  revalidatePath("/", "layout");
  redirect("/admin/content?saved=footer-main");
}
