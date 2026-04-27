import { z } from "zod";

const faqItemSchema = z.object({
  q: z.string(),
  a: z.string(),
});

export const homeHeroSchema = z.object({
  eyebrow: z.string(),
  h1Line1: z.string(),
  h1Highlight: z.string(),
  subhead: z.string(),
  primaryCta: z.string(),
  secondaryCta: z.string(),
  trustPoints: z.array(z.string()).min(1).max(8),
  stat1Val: z.string(),
  stat1Label: z.string(),
  /** Filled from live catalog count in mergeHomeHero; not stored in DB. */
  stat2Val: z.string(),
  stat2Label: z.string(),
  stat3Val: z.string(),
  stat3Label: z.string(),
  featuredEyebrow: z.string(),
  featuredTitle: z.string(),
  featuredLinkTemplate: z.string(),
});

export type HomeHeroContent = z.infer<typeof homeHeroSchema>;

/** Shape persisted in `content_blocks` / admin forms (no live stat2Val). */
export const homeHeroPersistSchema = homeHeroSchema.omit({ stat2Val: true });
export type HomeHeroPersistContent = z.infer<typeof homeHeroPersistSchema>;

export const DEFAULT_HOME_HERO: HomeHeroContent = {
  eyebrow: "Промышленная арматура · склад в Алматы",
  h1Line1: "Поставка промышленной арматуры",
  h1Highlight: "без срыва сроков",
  subhead:
    "Делаем КП с ценой, сроком и документами за 15 минут. Поставки с заводов и со склада в Алматы по всему Казахстану.",
  primaryCta: "Получить КП за 15 минут",
  secondaryCta: "Отправить заявку на почту",
  trustPoints: [
    "Склад в Алматы",
    "Поставка по договору",
    "Доставка по Казахстану",
    "Документы в комплекте",
  ],
  stat1Val: "15 мин",
  stat1Label: "готовим КП с ценой, сроком и сертификатами",
  stat2Val: "0 позиций",
  stat2Label: "задвижки, краны, затворы, клапаны, фильтры, фланцы",
  stat3Val: "Алматы",
  stat3Label: "свой склад, доставка по всему Казахстану",
  featuredEyebrow: "Популярные позиции",
  featuredTitle: "Часто запрашивают из каталога",
  featuredLinkTemplate: "Все {{COUNT}} позиций →",
};

export const trustStripSchema = z.object({
  paragraph: z.string(),
});

export type TrustStripContent = z.infer<typeof trustStripSchema>;

export const DEFAULT_TRUST_STRIP: TrustStripContent = {
  paragraph:
    "{{COMPANY}} поставляет промышленную арматуру генподрядчикам и монтажным бригадам по Казахстану. Сроки поставки и комплект документов фиксируем в договоре.",
};

export const requestCtaSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  footerHint: z.string(),
});

export type RequestCtaContent = z.infer<typeof requestCtaSchema>;

export const DEFAULT_REQUEST_CTA: RequestCtaContent = {
  title: "Получить коммерческое предложение",
  subtitle:
    "Оставьте контакт и задачу — в рабочее время подготовим коммерческое предложение за 15 минут.",
  footerHint: "Или напишите нам напрямую в WhatsApp",
};

export const homeFaqSchema = z.object({
  sectionEyebrow: z.string(),
  sectionTitle: z.string(),
  items: z.array(faqItemSchema).min(1).max(12),
});

export type HomeFaqContent = z.infer<typeof homeFaqSchema>;

export const DEFAULT_HOME_FAQ: HomeFaqContent = {
  sectionEyebrow: "Вопросы и ответы",
  sectionTitle: "Что спрашивают перед заказом",
  items: [
    {
      q: "Сколько стоит арматура и как формируется цена?",
      a: "Цена зависит от типа арматуры, материала корпуса, диаметра (DN), давления (PN) и объёма партии. Мы работаем напрямую с заводами, поэтому цена на большинство позиций на 15–25% ниже розничной. Итоговая стоимость фиксируется в КП.",
    },
    {
      q: "Какие сроки поставки?",
      a: "Со склада в Алматы — 1–3 рабочих дня по Казахстану. Под заказ с заводов — 2–6 недель в зависимости от позиции. Точный срок указываем в КП с учётом доступности на складе.",
    },
    {
      q: "Как быстро готовите коммерческое предложение?",
      a: "Обычно в течение 15 минут после получения спецификации или параметров (DN, PN, среда, объёмы). Под тендер готовим полный пакет документов в том же сроке.",
    },
    {
      q: "Как организована доставка по Казахстану?",
      a: "Транспортные компании или наш автотранспорт — до Астаны, Шымкента, Атырау, Актау, Караганды и других городов. Страхование груза и фотоотчёт отгрузки — по запросу.",
    },
    {
      q: "Можно ли работать с отсрочкой или постоплатой?",
      a: "Да. Для постоянных клиентов и по договору — отсрочка платежа или оплата по факту получения товара. Условия согласуем индивидуально.",
    },
    {
      q: "Есть ли сертификаты и гарантия качества?",
      a: "Паспорт качества, сертификат соответствия, протокол гидроиспытаний — на каждое изделие. Это стандарт, а не опция. При обнаружении брака возвращаем средства в день обращения.",
    },
  ],
};

export const homeMetaSchema = z.object({
  ogTitle: z.string(),
  ogDescription: z.string(),
});

export type HomeMetaContent = z.infer<typeof homeMetaSchema>;

export function defaultHomeMeta(companyName: string): HomeMetaContent {
  return {
    ogTitle: `${companyName} — трубопроводная арматура, задвижки, краны, клапаны в Казахстане`,
    ogDescription:
      "B2B поставки промышленной трубопроводной арматуры по Казахстану: задвижки, шаровые краны, затворы, клапаны DN15–DN1000. КП за 15 минут, ГОСТ/DIN/ISO, склад в Алматы.",
  };
}

export const pageMetaSchema = z.object({
  title: z.string(),
  description: z.string(),
});

export type PageMetaContent = z.infer<typeof pageMetaSchema>;

export function defaultAboutMeta(companyName: string): PageMetaContent {
  return {
    title: "О компании — B2B поставщик трубопроводной арматуры",
    description:
      `${companyName} — надёжный B2B партнёр по поставкам трубопроводной арматуры в Казахстан: задвижки, краны, клапаны, затворы. Прямые контракты, склад в Алматы, гидроиспытания, документы для тендера, доставка по РК.`,
  };
}

export function defaultContactsMeta(input: {
  companyName: string;
  phoneDisplay: string;
  email: string;
  city: string;
}): PageMetaContent {
  return {
    title: "Контакты — заявка, коммерческое предложение и доставка",
    description:
      `Контакты ${input.companyName} в Казахстане: ${input.phoneDisplay}, ${input.email}. Офис и склад в ${input.city}. Заявка на КП, консультация инженера, поставка арматуры по договору. КП в течение 15 минут в рабочее время.`,
  };
}

export const aboutCopySchema = z.object({
  headerLead: z.string(),
  overviewParagraphs: z.array(z.string()).min(1).max(8),
  /** Line under «Что мы поставляем»; supports {{CAT}} and {{PROD}}. */
  productGroupsLine: z.string(),
  ctaTitle: z.string(),
  ctaSubtitle: z.string(),
});

export type AboutCopyContent = z.infer<typeof aboutCopySchema>;

export const DEFAULT_ABOUT_COPY: AboutCopyContent = {
  headerLead:
    "B2B поставщик промышленной трубопроводной арматуры в Казахстане. Работаем напрямую с заводами-изготовителями.",
  overviewParagraphs: [
    "{{COMPANY}} — специализированный B2B-поставщик промышленной трубопроводной арматуры для предприятий Казахстана. Мы работаем напрямую с заводами-изготовителями в России, Китае и Европе, что позволяет предлагать конкурентные цены без лишних наценок.",
    "Основной клиент — промышленные предприятия, строительные организации, тепловые и энергетические компании, а также проектировщики и подрядчики, которым нужен полный комплект арматуры под объект с документацией для тендера.",
    "Каждая позиция проходит гидравлические испытания перед отгрузкой. Предоставляем паспорт качества, сертификат соответствия и протокол испытаний — это наш стандарт, а не дополнительная услуга.",
  ],
  productGroupsLine: "{{CAT}} категорий арматуры, {{PROD}} позиций в наличии и под заказ",
  ctaTitle: "Готовы к сотрудничеству?",
  ctaSubtitle:
    "Свяжитесь с нами — подберём арматуру под ваш объект и подготовим коммерческое предложение за 15 минут.",
};

export const contactsCopySchema = z.object({
  pageLead: z.string(),
  formTitle: z.string(),
  formHelper: z.string(),
});

export type ContactsCopyContent = z.infer<typeof contactsCopySchema>;

export const DEFAULT_CONTACTS_COPY: ContactsCopyContent = {
  pageLead:
    "Работаем с B2B-клиентами по всему Казахстану. Подготовим КП за 15 минут в рабочее время.",
  formTitle: "Получить КП",
  formHelper:
    "Укажите контакт и что вас интересует — подберём позиции и подготовим КП с ценами за 15 минут.",
};

export function applyPlaceholders(text: string, companyName: string): string {
  return text.replaceAll("{{COMPANY}}", companyName);
}

export function applyCountTemplate(text: string, count: number): string {
  return text.replaceAll("{{COUNT}}", String(count));
}

export function applyAboutCounts(
  text: string,
  values: { company: string; categories: number; products: number },
): string {
  return applyPlaceholders(text, values.company)
    .replaceAll("{{CAT}}", String(values.categories))
    .replaceAll("{{PROD}}", String(values.products));
}

function shallowMerge<T extends Record<string, unknown>>(base: T, patch: unknown): T {
  if (!patch || typeof patch !== "object") return base;
  return { ...base, ...patch };
}

export function mergeHomeHero(dbJson: unknown, productCount: number): HomeHeroContent {
  const merged = shallowMerge(DEFAULT_HOME_HERO as unknown as Record<string, unknown>, dbJson);
  const parsed = homeHeroSchema.safeParse(merged);
  const base = parsed.success ? parsed.data : DEFAULT_HOME_HERO;
  return {
    ...base,
    stat2Val: `${productCount} позиций`,
  };
}

export function mergeTrustStrip(dbJson: unknown): TrustStripContent {
  const merged = shallowMerge(DEFAULT_TRUST_STRIP as unknown as Record<string, unknown>, dbJson);
  const parsed = trustStripSchema.safeParse(merged);
  return parsed.success ? parsed.data : DEFAULT_TRUST_STRIP;
}

export function mergeRequestCta(dbJson: unknown): RequestCtaContent {
  const merged = shallowMerge(DEFAULT_REQUEST_CTA as unknown as Record<string, unknown>, dbJson);
  const parsed = requestCtaSchema.safeParse(merged);
  return parsed.success ? parsed.data : DEFAULT_REQUEST_CTA;
}

export function mergeHomeFaq(dbJson: unknown): HomeFaqContent {
  const merged = shallowMerge(DEFAULT_HOME_FAQ as unknown as Record<string, unknown>, dbJson);
  const parsed = homeFaqSchema.safeParse(merged);
  return parsed.success ? parsed.data : DEFAULT_HOME_FAQ;
}

export function mergeHomeMeta(dbJson: unknown, companyName: string): HomeMetaContent {
  const defaults = defaultHomeMeta(companyName);
  const merged = shallowMerge(defaults as unknown as Record<string, unknown>, dbJson);
  const parsed = homeMetaSchema.safeParse(merged);
  return parsed.success ? parsed.data : defaults;
}

export function mergeAboutMeta(dbJson: unknown, companyName: string): PageMetaContent {
  const defaults = defaultAboutMeta(companyName);
  const merged = shallowMerge(defaults as unknown as Record<string, unknown>, dbJson);
  const parsed = pageMetaSchema.safeParse(merged);
  return parsed.success ? parsed.data : defaults;
}

export function mergeContactsMeta(
  dbJson: unknown,
  input: {
    companyName: string;
    phoneDisplay: string;
    email: string;
    city: string;
  },
): PageMetaContent {
  const defaults = defaultContactsMeta(input);
  const merged = shallowMerge(defaults as unknown as Record<string, unknown>, dbJson);
  const parsed = pageMetaSchema.safeParse(merged);
  return parsed.success ? parsed.data : defaults;
}

export function mergeAboutCopy(dbJson: unknown): AboutCopyContent {
  const merged = shallowMerge(DEFAULT_ABOUT_COPY as unknown as Record<string, unknown>, dbJson);
  const parsed = aboutCopySchema.safeParse(merged);
  return parsed.success ? parsed.data : DEFAULT_ABOUT_COPY;
}

export function mergeContactsCopy(dbJson: unknown): ContactsCopyContent {
  const merged = shallowMerge(
    DEFAULT_CONTACTS_COPY as unknown as Record<string, unknown>,
    dbJson,
  );
  const parsed = contactsCopySchema.safeParse(merged);
  return parsed.success ? parsed.data : DEFAULT_CONTACTS_COPY;
}
