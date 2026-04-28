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
  /** Средняя колонка статистики: маркетинговое значение (например «700+ позиций»). */
  stat2MarketingVal: z.string(),
  stat3Val: z.string(),
  stat3Label: z.string(),
  featuredEyebrow: z.string(),
  featuredTitle: z.string(),
  featuredLinkTemplate: z.string(),
  /** Текст префилла WhatsApp для кнопки КП в герое. */
  kpWhatsAppMessage: z.string(),
  /** Подпись над каруселью товаров в герое (вариант hero карусели). */
  heroShowcaseRibbonLabel: z.string(),
});

export type HomeHeroContent = z.infer<typeof homeHeroSchema>;

/** Shape persisted in `content_blocks` / admin forms (no live stat2Val). */
export const homeHeroPersistSchema = homeHeroSchema.omit({ stat2Val: true });
export type HomeHeroPersistContent = z.infer<typeof homeHeroPersistSchema>;

/** Маркетинговая цифра для публичного текста (ссылка «Все {{COUNT}}…» в hero), не равна фактическому числу SKU. */
export const MARKETING_CATALOG_LINK_COUNT = "700+";

const productSlugListSchema = z.array(z.string().trim().min(1)).min(1).max(12);

export const homeProductShowcasesSchema = z.object({
  heroProductSlugs: productSlugListSchema,
  catalogHitSlugs: productSlugListSchema,
});

export type HomeProductShowcasesContent = z.infer<typeof homeProductShowcasesSchema>;

export const DEFAULT_HOME_PRODUCT_SHOWCASES: HomeProductShowcasesContent = {
  heroProductSlugs: [
    "zadvizhka-30ch39r-dn50-pn16",
    "kran-sharovoy-stal-dn1000-pn25",
    "zatvor-dn50-pn10",
    "klapan-chugun-dn200-pn16",
  ],
  catalogHitSlugs: [
    "zadvizhka-30ch39r-dn50-pn16",
    "kran-sharovoy-stal-dn1000-pn25",
    "zatvor-dn50-pn10",
    "klapan-chugun-dn200-pn16",
    "flanets-stal-dn100-pn16",
  ],
};

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
  stat2MarketingVal: "700+ позиций",
  stat3Val: "Алматы",
  stat3Label: "свой склад, доставка по всему Казахстану",
  featuredEyebrow: "Популярные позиции",
  featuredTitle: "Часто запрашивают из каталога",
  featuredLinkTemplate: "Все {{COUNT}} позиций →",
  kpWhatsAppMessage: "Здравствуйте! Хочу получить КП по промышленной запорной арматуре.",
  heroShowcaseRibbonLabel: "Витрина",
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
  productGroupsLine: "{{CAT}} категорий арматуры, 700+ позиций в наличии и под заказ",
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

export function applyCountTemplate(text: string, count: number | string): string {
  return text.replaceAll("{{COUNT}}", String(count));
}

export function applyAboutCounts(
  text: string,
  values: {
    company: string;
    categories: number;
    products: number;
    /** Подстановка `{{PROD}}` для маркетинга (например «700+»). Без этого — фактическое число позиций. */
    productsMarketing?: string;
  },
): string {
  const prod = values.productsMarketing ?? String(values.products);
  return applyPlaceholders(text, values.company)
    .replaceAll("{{CAT}}", String(values.categories))
    .replaceAll("{{PROD}}", prod);
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

export function mergeHomeProductShowcases(dbJson: unknown): HomeProductShowcasesContent {
  const merged = shallowMerge(
    DEFAULT_HOME_PRODUCT_SHOWCASES as unknown as Record<string, unknown>,
    dbJson,
  );
  const parsed = homeProductShowcasesSchema.safeParse(merged);
  return parsed.success ? parsed.data : DEFAULT_HOME_PRODUCT_SHOWCASES;
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

/* ── Shared nav link ─────────────────────────────────────────────── */

export const navLinkSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
});

export type NavLink = z.infer<typeof navLinkSchema>;

/* ── Header: top bar ──────────────────────────────────────────────── */

export const headerTopNavSchema = z.object({
  links: z.array(navLinkSchema).min(1).max(12),
});

export type HeaderTopNavContent = z.infer<typeof headerTopNavSchema>;

export const DEFAULT_HEADER_TOP_NAV: HeaderTopNavContent = {
  links: [
    { label: "О компании", href: "/about" },
    { label: "Сертификаты", href: "/certificates" },
    { label: "Доставка", href: "/delivery" },
    { label: "Контакты", href: "/contacts" },
  ],
};

export function mergeHeaderTopNav(dbJson: unknown): HeaderTopNavContent {
  const merged = shallowMerge(
    DEFAULT_HEADER_TOP_NAV as unknown as Record<string, unknown>,
    dbJson,
  );
  const parsed = headerTopNavSchema.safeParse(merged);
  return parsed.success ? parsed.data : DEFAULT_HEADER_TOP_NAV;
}

/* ── Home: каталог / хиты ─────────────────────────────────────────── */

export const homeCategoriesSchema = z.object({
  sectionEyebrow: z.string(),
  sectionTitle: z.string(),
  sectionLead: z.string(),
  sectionCtaLabel: z.string(),
  sectionCtaHref: z.string(),
  carouselEyebrow: z.string(),
  carouselTitle: z.string(),
  carouselLinkLabel: z.string(),
  carouselLinkHref: z.string(),
  carouselBadgeLabel: z.string(),
});

export type HomeCategoriesContent = z.infer<typeof homeCategoriesSchema>;

export const DEFAULT_HOME_CATEGORIES: HomeCategoriesContent = {
  sectionEyebrow: "Каталог MANSVALVE GROUP",
  sectionTitle: "Хиты продаж каталога",
  sectionLead:
    "Позиции, которые чаще всего запрашивают подрядчики, монтажные бригады и промышленные заказчики для комплектации объектов. Быстро уточним наличие, срок поставки и комплект документов.",
  sectionCtaLabel: "Все позиции",
  sectionCtaHref: "/catalog",
  carouselEyebrow: "Хит продаж",
  carouselTitle: "Чаще всего выбирают для объектов",
  carouselLinkLabel: "Каталог",
  carouselLinkHref: "/catalog",
  carouselBadgeLabel: "Часто запрашивают",
};

export function mergeHomeCategories(dbJson: unknown): HomeCategoriesContent {
  const merged = shallowMerge(
    DEFAULT_HOME_CATEGORIES as unknown as Record<string, unknown>,
    dbJson,
  );
  const parsed = homeCategoriesSchema.safeParse(merged);
  return parsed.success ? parsed.data : DEFAULT_HOME_CATEGORIES;
}

/* ── Home: преимущества ─────────────────────────────────────────── */

export const homeWhyUsItemSchema = z.object({
  metric: z.string(),
  title: z.string(),
  desc: z.string(),
});

export const homeWhyUsSchema = z.object({
  sectionEyebrow: z.string(),
  sectionTitle: z.string(),
  items: z.array(homeWhyUsItemSchema).min(1).max(8),
});

export type HomeWhyUsContent = z.infer<typeof homeWhyUsSchema>;

export const DEFAULT_HOME_WHY_US: HomeWhyUsContent = {
  sectionEyebrow: "Преимущества",
  sectionTitle:
    "Почему нас выбирают подрядчики, ТЭЦ, нефтегазовые и промышленные компании",
  items: [
    {
      metric: "15 минут",
      title: "Коммерческое предложение за 15 минут",
      desc: "Подготовим актуальную цену, срок поставки и спецификацию в одном ответе.",
    },
    {
      metric: "100% контроль",
      title: "Контроль качества перед отгрузкой",
      desc: "Проверка каждой партии, соответствие заявке и паспорт качества.",
    },
    {
      metric: "До 25% выгоднее",
      title: "Экономия до 25% на закупке",
      desc: "Прямые заводские контракты, оптимальная логистика и складской запас в Алматы.",
    },
    {
      metric: "ГОСТ / DIN / ISO",
      title: "Документы под тендер и объект",
      desc: "Сертификаты, паспорта, ГОСТ / DIN / ISO и полный комплект закрывающих документов.",
    },
    {
      metric: "Казахстан",
      title: "Поставка по всему Казахстану",
      desc: "Алматы, Астана, Шымкент и регионы — отгрузка точно в согласованный срок.",
    },
    {
      metric: "B2B / B2G",
      title: "Работаем с бизнесом и госзаказчиками",
      desc: "Договор, НДС, спецификации, счета и сопровождение поставки до закрытия сделки.",
    },
  ],
};

export function mergeHomeWhyUs(dbJson: unknown): HomeWhyUsContent {
  const merged = shallowMerge(DEFAULT_HOME_WHY_US as unknown as Record<string, unknown>, dbJson);
  const parsed = homeWhyUsSchema.safeParse(merged);
  return parsed.success ? parsed.data : DEFAULT_HOME_WHY_US;
}

/* ── Home: как работаем ─────────────────────────────────────────── */

export const howItWorksStepSchema = z.object({
  num: z.string(),
  title: z.string(),
  desc: z.string(),
});

export const homeHowItWorksSchema = z.object({
  sectionEyebrow: z.string(),
  sectionTitle: z.string(),
  steps: z.array(howItWorksStepSchema).min(1).max(8),
});

export type HomeHowItWorksContent = z.infer<typeof homeHowItWorksSchema>;

export const DEFAULT_HOME_HOW_IT_WORKS: HomeHowItWorksContent = {
  sectionEyebrow: "Как мы работаем",
  sectionTitle: "От заявки до поставки — за 5 понятных шагов",
  steps: [
    { num: "01", title: "ЗАЯВКА", desc: "Получаем ваш запрос или спецификацию." },
    { num: "02", title: "КП ЗА 15 МИНУТ", desc: "Цена, наличие, сроки, документы." },
    { num: "03", title: "ДОГОВОР", desc: "Официально с НДС, фиксируем условия." },
    { num: "04", title: "ПОСТАВКА", desc: "Склад / завод / производство под заказ." },
    { num: "05", title: "ДОСТАВКА", desc: "По адресу заказчика по всему Казахстану." },
  ],
};

export function mergeHomeHowItWorks(dbJson: unknown): HomeHowItWorksContent {
  const merged = shallowMerge(
    DEFAULT_HOME_HOW_IT_WORKS as unknown as Record<string, unknown>,
    dbJson,
  );
  const parsed = homeHowItWorksSchema.safeParse(merged);
  return parsed.success ? parsed.data : DEFAULT_HOME_HOW_IT_WORKS;
}

/* ── Home: кому поставляем ──────────────────────────────────────── */

export const whoWeSupplySegmentSchema = z.object({
  title: z.string(),
  text: z.string(),
});

export const homeWhoWeSupplySchema = z.object({
  sectionEyebrow: z.string(),
  sectionTitle: z.string(),
  sectionLead: z.string(),
  segments: z.array(whoWeSupplySegmentSchema).min(1).max(8),
});

export type HomeWhoWeSupplyContent = z.infer<typeof homeWhoWeSupplySchema>;

export const DEFAULT_HOME_WHO_WE_SUPPLY: HomeWhoWeSupplyContent = {
  sectionEyebrow: "С кем работаем",
  sectionTitle: "Кому поставляем промышленную запорную арматуру",
  sectionLead:
    "Работаем в сегментах B2B и B2G. Закрываем объектные поставки по договору с прогнозируемыми сроками, фиксированной спецификацией и полным комплектом документов.",
  segments: [
    {
      title: "Генподрядчики и EPC-компании",
      text: "Комплектация строительных и промышленных объектов по графику проекта.",
    },
    {
      title: "Нефтегазовые компании, ТЭЦ и энергетика",
      text: "Поставка арматуры для производственных, энергетических и технологических объектов.",
    },
    {
      title: "Промышленные заводы и производственные предприятия",
      text: "Плановые закупки, модернизация и оперативная замена оборудования.",
    },
    {
      title: "Монтажные и сервисные подрядчики",
      text: "Быстрая комплектация объектов, ремонтов и аварийных заявок.",
    },
    {
      title: "Водоканалы, ЖКХ и инфраструктурные объекты",
      text: "Поставка для коммунальных сетей, водоснабжения и городских объектов.",
    },
    {
      title: "Государственные заказчики и тендерные проекты",
      text: "Работа по договору, спецификациям и требованиям закупочных процедур.",
    },
  ],
};

export function mergeHomeWhoWeSupply(dbJson: unknown): HomeWhoWeSupplyContent {
  const merged = shallowMerge(
    DEFAULT_HOME_WHO_WE_SUPPLY as unknown as Record<string, unknown>,
    dbJson,
  );
  const parsed = homeWhoWeSupplySchema.safeParse(merged);
  return parsed.success ? parsed.data : DEFAULT_HOME_WHO_WE_SUPPLY;
}

/* ── Home: кейсы ─────────────────────────────────────────────────── */

export const deliveryCaseItemSchema = z.object({
  title: z.string(),
  text: z.string(),
  positions: z.string(),
  term: z.string(),
  termLabel: z.string(),
  object: z.string(),
  result: z.string(),
});

export const homeDeliveryCaseSchema = z.object({
  sectionEyebrow: z.string(),
  sectionTitle: z.string(),
  sectionLead: z.string(),
  kitMetaLabel: z.string(),
  objectMetaLabel: z.string(),
  resultPrefix: z.string(),
  summaryCasesValue: z.string(),
  summaryCasesLabel: z.string(),
  summaryDaysValue: z.string(),
  summaryDaysLabel: z.string(),
  summaryUnitsValue: z.string(),
  summaryUnitsLabel: z.string(),
  cases: z.array(deliveryCaseItemSchema).min(1).max(12),
});

export type HomeDeliveryCaseContent = z.infer<typeof homeDeliveryCaseSchema>;

export const DEFAULT_HOME_DELIVERY_CASE: HomeDeliveryCaseContent = {
  sectionEyebrow: "Реализованные поставки",
  sectionTitle: "Кейсы MANSVALVE GROUP",
  sectionLead:
    "Показываем типовые поставки: что требовалось, какой комплект закрыли и какой результат получил заказчик.",
  kitMetaLabel: "Комплект",
  objectMetaLabel: "Объект",
  resultPrefix: "Результат:",
  summaryCasesValue: "5",
  summaryCasesLabel: "кейсов",
  summaryDaysValue: "1-5",
  summaryDaysLabel: "дней",
  summaryUnitsValue: "200",
  summaryUnitsLabel: "единиц",
  cases: [
    {
      title: "Комплектация жилого комплекса без срыва сроков",
      text: "Для генподрядной организации поставили задвижки, фланцы, затворы и крепёж для внутренних инженерных сетей объекта. Часть позиций заменили на складские аналоги для ускорения поставки.",
      positions: "64 ед.",
      term: "2 дня",
      termLabel: "Срок поставки",
      object: "Жилой комплекс",
      result: "Монтажные работы продолжены по графику без задержек.",
    },
    {
      title: "Срочная поставка для теплосетей",
      text: "Оперативно закрыли заявку на стальные задвижки и комплектующие для аварийно-восстановительных работ.",
      positions: "29 ед.",
      term: "1 день",
      termLabel: "Срок отгрузки",
      object: "Городская теплосеть",
      result: "Участок введён в работу в кратчайшие сроки без простоя бригады.",
    },
    {
      title: "Поставка для производственного предприятия",
      text: "Подобрали и поставили промышленную запорную арматуру для модернизации трубопроводного узла предприятия.",
      positions: "48 ед.",
      term: "4 дня",
      termLabel: "Срок поставки",
      object: "Производственный завод",
      result: "Работы выполнены в плановое окно остановки оборудования.",
    },
    {
      title: "Комплектация объекта водоснабжения",
      text: "Для подрядчика укомплектовали объект дисковыми затворами, обратными клапанами и фланцами согласно спецификации.",
      positions: "37 ед.",
      term: "3 дня",
      termLabel: "Срок поставки",
      object: "Узел водоснабжения",
      result: "Объект выведен в монтаж без дополнительных закупок и задержек.",
    },
    {
      title: "Поставка для нефтегазового подрядчика",
      text: "Закрыли заявку на трубопроводную арматуру и крепёж для технологического участка объекта.",
      positions: "22 ед.",
      term: "5 дней",
      termLabel: "Срок поставки",
      object: "Производственная площадка",
      result: "График работ сохранён, этап выполнен в установленный срок.",
    },
  ],
};

export function mergeHomeDeliveryCase(dbJson: unknown): HomeDeliveryCaseContent {
  const merged = shallowMerge(
    DEFAULT_HOME_DELIVERY_CASE as unknown as Record<string, unknown>,
    dbJson,
  );
  const parsed = homeDeliveryCaseSchema.safeParse(merged);
  return parsed.success ? parsed.data : DEFAULT_HOME_DELIVERY_CASE;
}

/* ── Footer ─────────────────────────────────────────────────────── */

export const footerPreCtaSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  whatsappPrimary: z.string(),
  whatsappSecondary: z.string(),
  emailPrimary: z.string(),
  emailSecondary: z.string(),
  /** Текст префилла WhatsApp для кнопки КП в pre-footer. */
  kpWhatsAppMessage: z.string(),
});

export type FooterPreCtaContent = z.infer<typeof footerPreCtaSchema>;

export const DEFAULT_FOOTER_PRE_CTA: FooterPreCtaContent = {
  title: "Нужна цена или подбор арматуры?",
  subtitle:
    "Получите коммерческое предложение с ценой, сроками и документами за 15 минут.",
  whatsappPrimary: "Получить КП в WhatsApp",
  whatsappSecondary: "Быстрый ответ",
  emailPrimary: "Отправить заявку",
  emailSecondary: "На почту",
  kpWhatsAppMessage: "Здравствуйте! Хочу получить КП по промышленной запорной арматуре.",
};

export function mergeFooterPreCta(dbJson: unknown): FooterPreCtaContent {
  const merged = shallowMerge(
    DEFAULT_FOOTER_PRE_CTA as unknown as Record<string, unknown>,
    dbJson,
  );
  const parsed = footerPreCtaSchema.safeParse(merged);
  return parsed.success ? parsed.data : DEFAULT_FOOTER_PRE_CTA;
}

export const footerTrustBarSchema = z.object({
  items: z.array(z.string().min(1)).min(1).max(8),
});

export type FooterTrustBarContent = z.infer<typeof footerTrustBarSchema>;

export const DEFAULT_FOOTER_TRUST_BAR: FooterTrustBarContent = {
  items: [
    "Работаем с НДС — Официально",
    "Сертификаты качества — Вся продукция сертифицирована",
    "Доставка по Казахстану — и странам СНГ",
    "Склад в Алматы — и поставки под заказ",
    "Работаем с ТЭЦ, заводами, подрядчиками и гос. компаниями",
  ],
};

export function mergeFooterTrustBar(dbJson: unknown): FooterTrustBarContent {
  const merged = shallowMerge(
    DEFAULT_FOOTER_TRUST_BAR as unknown as Record<string, unknown>,
    dbJson,
  );
  const parsed = footerTrustBarSchema.safeParse(merged);
  return parsed.success ? parsed.data : DEFAULT_FOOTER_TRUST_BAR;
}

export const footerMainSchema = z.object({
  brandTagline: z.string(),
  /** Пустая строка — изображение по умолчанию из `header-logo`. */
  brandLogoSrc: z.string(),
  legalNameLine: z.string(),
  addressLine: z.string(),
  workHoursLine: z.string(),
  catalogHeading: z.string(),
  companyHeading: z.string(),
  contactHeading: z.string(),
  whatsappButtonLabel: z.string(),
  bottomCopyright: z.string(),
  bottomTagline: z.string(),
  termsLabel: z.string(),
  privacyLabel: z.string(),
  catalogLinks: z.array(navLinkSchema).min(1).max(24),
  companyLinks: z.array(navLinkSchema).min(1).max(24),
});

export type FooterMainContent = z.infer<typeof footerMainSchema>;

export const DEFAULT_FOOTER_MAIN: FooterMainContent = {
  brandTagline:
    "Промышленная арматура в Казахстане. Прямые поставки с заводов, сертификаты, доставка по РК и СНГ.",
  brandLogoSrc: "",
  legalNameLine: "ТОО MANSVALVE GROUP",
  addressLine: "Алматы, Казахстан",
  workHoursLine: "Пн – Пт: 09:00 – 18:00",
  catalogHeading: "Каталог",
  companyHeading: "Компания",
  contactHeading: "Связаться с нами",
  whatsappButtonLabel: "Написать в WhatsApp",
  bottomCopyright: "© {{YEAR}} MANSVALVE GROUP. Все права защищены.",
  bottomTagline: "Поставки по Казахстану и странам СНГ",
  termsLabel: "Пользовательское соглашение",
  privacyLabel: "Политика конфиденциальности",
  catalogLinks: [
    { label: "Задвижки", href: "/catalog/category/zadvizhki" },
    { label: "Затворы дисковые", href: "/catalog/subcategory/zatvory-diskovye" },
    { label: "Краны шаровые", href: "/catalog/category/krany-sharovye" },
    { label: "Обратные клапаны", href: "/catalog/subcategory/klapany-obratnye" },
    { label: "Фланцы", href: "/catalog/subcategory/flansy" },
    { label: "Электроприводы", href: "/catalog/category/elektroprivody" },
    { label: "Фитинги", href: "/catalog" },
    { label: "Другие товары", href: "/catalog" },
  ],
  companyLinks: [
    { label: "О компании", href: "/about" },
    { label: "Сертификаты", href: "/certificates" },
    { label: "Доставка и оплата", href: "/delivery" },
    { label: "Контакты", href: "/contacts" },
    { label: "FAQ", href: "/#faq" },
    { label: "Политика конфиденциальности", href: "/privacy" },
  ],
};

export function mergeFooterMain(dbJson: unknown): FooterMainContent {
  const merged = shallowMerge(DEFAULT_FOOTER_MAIN as unknown as Record<string, unknown>, dbJson);
  const parsed = footerMainSchema.safeParse(merged);
  return parsed.success ? parsed.data : DEFAULT_FOOTER_MAIN;
}

export function applyYearPlaceholder(text: string, year: number): string {
  return text.replaceAll("{{YEAR}}", String(year));
}
