import { AdminFormFooter } from "@/components/admin/AdminFormFooter";
import { ContentSection } from "@/components/admin/ContentSection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { requireAdmin } from "@/lib/auth/current-user";
import { isDatabaseConfigured } from "@/lib/db/client";
import { SITE_CONTENT_KEYS } from "@/lib/site-content/keys";
import {
  defaultAboutMeta,
  defaultContactsMeta,
  defaultHomeMeta,
  mergeAboutCopy,
  mergeAboutMeta,
  mergeAboutPage,
  mergeCertificatesPage,
  mergeContactsCopy,
  mergeContactsMeta,
  mergeContactsPage,
  mergeDeliveryPage,
  mergeFooterMain,
  mergeFooterPreCta,
  mergeFooterTrustBar,
  mergeHeaderTopNav,
  mergeHomeCategories,
  mergeHomeDeliveryCase,
  mergeHomeFaq,
  mergeHomeHero,
  mergeHomeHowItWorks,
  mergeHomeMeta,
  mergeHomeProductShowcases,
  mergeHomeWhoWeSupply,
  mergeHomeWhyUs,
  mergePrivacyPage,
  mergeRequestCta,
  mergeTermsPage,
  mergeTrustStrip,
} from "@/lib/site-content/models";
import { getContentBlock } from "@/lib/services/content-blocks";
import { COMPANY } from "@/lib/company";

import {
  saveAboutCopyAction,
  saveAboutMetaAction,
  saveContactsCopyAction,
  saveContactsMetaAction,
  saveFooterMainAction,
  saveFooterPreCtaAction,
  saveFooterTrustBarAction,
  saveHeaderTopNavAction,
  saveHomeCategoriesAction,
  saveHomeDeliveryCaseAction,
  saveHomeFaqAction,
  saveHomeHeroAction,
  saveHomeHowItWorksAction,
  saveHomeMetaAction,
  saveHomeProductShowcasesAction,
  saveHomeWhoWeSupplyAction,
  saveHomeWhyUsAction,
  savePageAboutAction,
  savePageCertificatesAction,
  savePageContactsAction,
  savePageDeliveryAction,
  savePagePrivacyAction,
  savePageTermsAction,
  saveRequestCtaAction,
  saveTrustStripAction,
} from "./actions";

const SAVED_LABELS: Record<string, string> = {
  "header-nav": "Меню в шапке обновлено",
  hero: "Главный баннер сохранён",
  trust: "Текст под баннером сохранён",
  "product-showcases": "Подборка товаров в баннере сохранена",
  "home-categories": "Блок «Хиты каталога» сохранён",
  rcta: "Блок с формой заявки сохранён",
  faq: "Вопросы и ответы сохранены",
  meta: "Описание для поиска (главная) сохранено",
  about: "Страница «О компании» сохранена",
  "about-meta": "Описание для поиска («О компании») сохранено",
  contacts: "Тексты страницы контактов сохранены",
  "contacts-meta": "Описание для поиска (контакты) сохранено",
  "page-about": "Страница «О компании» (полный блок) сохранена",
  "page-contacts": "Страница «Контакты» (полный блок) сохранена",
  "page-delivery": "Страница «Доставка» сохранена",
  "page-certificates": "Страница «Сертификаты» сохранена",
  "page-privacy": "Страница «Политика» сохранена",
  "page-terms": "Страница «Условия использования» сохранена",
  "home-why-us": "Блок преимуществ сохранён",
  "home-how-it-works": "Этапы работы сохранены",
  "home-who-we-supply": "Блок «Кому поставляем» сохранён",
  "home-delivery-case": "Кейсы сохранены",
  "footer-pre-cta": "Блок над подвалом сохранён",
  "footer-trust": "Полоска доверия в подвале сохранена",
  "footer-main": "Основной подвал сохранён",
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AdminContentPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  await requireAdmin("/admin/content");
  const sp = await searchParams;

  if (!isDatabaseConfigured()) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-amber-200 bg-amber-50 px-5 py-8 text-center">
        <p className="text-sm font-medium text-amber-950">Редактирование недоступно</p>
        <p className="mt-2 text-sm text-amber-900/90">
          Подключите базу данных — после этого тексты и изображения сайта можно будет менять здесь.
        </p>
      </div>
    );
  }

  const [
    heroRow,
    trustRow,
    rctaRow,
    faqRow,
    metaRow,
    aboutMetaRow,
    aboutRow,
    contactsMetaRow,
    contactsRow,
    productShowcasesRow,
    headerNavRow,
    homeCategoriesRow,
    homeWhyUsRow,
    homeHowItWorksRow,
    homeWhoWeSupplyRow,
    homeDeliveryCaseRow,
    footerPreCtaRow,
    footerTrustRow,
    footerMainRow,
    pageAboutRow,
    pageContactsRow,
    pageDeliveryRow,
    pageCertificatesRow,
    pagePrivacyRow,
    pageTermsRow,
  ] = await Promise.all([
    getContentBlock(SITE_CONTENT_KEYS.homeHero),
    getContentBlock(SITE_CONTENT_KEYS.homeTrustStrip),
    getContentBlock(SITE_CONTENT_KEYS.homeRequestCta),
    getContentBlock(SITE_CONTENT_KEYS.homeFaq),
    getContentBlock(SITE_CONTENT_KEYS.homeMeta),
    getContentBlock(SITE_CONTENT_KEYS.aboutMeta),
    getContentBlock(SITE_CONTENT_KEYS.aboutCopy),
    getContentBlock(SITE_CONTENT_KEYS.contactsMeta),
    getContentBlock(SITE_CONTENT_KEYS.contactsCopy),
    getContentBlock(SITE_CONTENT_KEYS.homeProductShowcases),
    getContentBlock(SITE_CONTENT_KEYS.headerTopNav),
    getContentBlock(SITE_CONTENT_KEYS.homeCategories),
    getContentBlock(SITE_CONTENT_KEYS.homeWhyUs),
    getContentBlock(SITE_CONTENT_KEYS.homeHowItWorks),
    getContentBlock(SITE_CONTENT_KEYS.homeWhoWeSupply),
    getContentBlock(SITE_CONTENT_KEYS.homeDeliveryCase),
    getContentBlock(SITE_CONTENT_KEYS.footerPreCta),
    getContentBlock(SITE_CONTENT_KEYS.footerTrustBar),
    getContentBlock(SITE_CONTENT_KEYS.footerMain),
    getContentBlock(SITE_CONTENT_KEYS.pageAbout),
    getContentBlock(SITE_CONTENT_KEYS.pageContacts),
    getContentBlock(SITE_CONTENT_KEYS.pageDelivery),
    getContentBlock(SITE_CONTENT_KEYS.pageCertificates),
    getContentBlock(SITE_CONTENT_KEYS.pagePrivacy),
    getContentBlock(SITE_CONTENT_KEYS.pageTerms),
  ]);

  const hero = mergeHomeHero(heroRow?.data, 0);
  const trust = mergeTrustStrip(trustRow?.data);
  const rcta = mergeRequestCta(rctaRow?.data);
  const faq = mergeHomeFaq(faqRow?.data);
  const meta = mergeHomeMeta(metaRow?.data, COMPANY.name);
  const aboutMeta = mergeAboutMeta(aboutMetaRow?.data, COMPANY.name);
  const about = mergeAboutCopy(aboutRow?.data);
  const contactsMeta = mergeContactsMeta(contactsMetaRow?.data, {
    companyName: COMPANY.name,
    phoneDisplay: COMPANY.phoneDisplay,
    email: COMPANY.email,
    city: COMPANY.address.city,
  });
  const contacts = mergeContactsCopy(contactsRow?.data);
  const productShowcases = mergeHomeProductShowcases(productShowcasesRow?.data);
  const headerNav = mergeHeaderTopNav(headerNavRow?.data);
  const homeCategories = mergeHomeCategories(homeCategoriesRow?.data);
  const homeWhyUs = mergeHomeWhyUs(homeWhyUsRow?.data);
  const homeHowItWorks = mergeHomeHowItWorks(homeHowItWorksRow?.data);
  const homeWhoWeSupply = mergeHomeWhoWeSupply(homeWhoWeSupplyRow?.data);
  const homeDeliveryCase = mergeHomeDeliveryCase(homeDeliveryCaseRow?.data);
  const footerPreCta = mergeFooterPreCta(footerPreCtaRow?.data);
  const footerTrust = mergeFooterTrustBar(footerTrustRow?.data);
  const footerMain = mergeFooterMain(footerMainRow?.data);

  const pageAbout = mergeAboutPage(pageAboutRow?.data, aboutMetaRow?.data, COMPANY.name);
  const pageContacts = mergeContactsPage(
    pageContactsRow?.data,
    contactsMetaRow?.data,
    contactsRow?.data,
    {
      companyName: COMPANY.name,
      phoneDisplay: COMPANY.phoneDisplay,
      email: COMPANY.email,
      city: COMPANY.address.city,
    },
  );
  const pageDelivery = mergeDeliveryPage(pageDeliveryRow?.data);
  const pageCertificates = mergeCertificatesPage(pageCertificatesRow?.data);
  const pagePrivacy = mergePrivacyPage(pagePrivacyRow?.data);
  const pageTerms = mergeTermsPage(pageTermsRow?.data);

  return (
    <div className="mx-auto max-w-5xl space-y-10 pb-12">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Контент сайта</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          Здесь редактируются тексты и подписи для публичных страниц. Если что‑то не заполнить, на сайте останутся
          стандартные формулировки.
        </p>
      </header>

      {sp.error ? (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
          role="alert"
        >
          {sp.error}
        </div>
      ) : null}
      {sp.saved ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {SAVED_LABELS[sp.saved] ?? "Изменения сохранены."}
        </div>
      ) : null}

      <ContentSection
        title="Шапка сайта"
        description="Верхняя строка ссылок над основным меню. У каждой строки: как показать ссылку и куда она ведёт."
      >
      <Card>
        <CardHeader>
          <CardTitle>Верхнее меню</CardTitle>
          <CardDescription>
            Каждая строка — это одна ссылка: сначала текст, символ &quot;|&quot;, затем адрес (например{" "}
            <span className="whitespace-nowrap">О компании|/about</span>).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={saveHeaderTopNavAction} className="max-w-3xl space-y-3">
            <div className="space-y-1">
              <Label htmlFor="header_nav_links">Строки меню</Label>
              <p className="text-xs text-slate-500">Такой же формат, как для списков ссылок в подвале.</p>
              <Textarea
                id="header_nav_links"
                name="links"
                rows={6}
                defaultValue={headerNav.links.map((l) => `${l.label}|${l.href}`).join("\n")}
                className="font-mono text-xs sm:text-sm"
              />
            </div>
            <AdminFormFooter previewHref="/" saveLabel="Сохранить меню" />
          </form>
        </CardContent>
      </Card>
      </ContentSection>

      <ContentSection
        title="Главная страница"
        description="Баннер, блоки с товарами, преимущества, этапы, кейсы, форма заявки и вопросы — всё показывается на главной."
      >
      <Card>
        <CardHeader>
          <CardTitle>Главный баннер</CardTitle>
          <CardDescription>
            Первый экран главной страницы: заголовки, кнопки и три цифры со словами под ними. В средней колонке
            подставляется ваше маркетинговое значение и подпись (например «700+ позиций»).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={saveHomeHeroAction} className="grid max-w-3xl gap-3">
            <Field label="Eyebrow" name="eyebrow" defaultValue={hero.eyebrow} />
            <Field label="H1 (до акцента)" name="h1Line1" defaultValue={hero.h1Line1} />
            <Field label="H1 акцент (цвет)" name="h1Highlight" defaultValue={hero.h1Highlight} />
            <div className="space-y-1">
              <Label htmlFor="subhead">Подзаголовок</Label>
              <Textarea id="subhead" name="subhead" rows={3} defaultValue={hero.subhead} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Кнопка 1" name="primaryCta" defaultValue={hero.primaryCta} />
              <Field label="Кнопка 2 (текст)" name="secondaryCta" defaultValue={hero.secondaryCta} />
            </div>
            <p className="text-xs text-muted-foreground">Плашки доверия (4 строки)</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {[0, 1, 2, 3].map((i) => (
                <Field
                  key={i}
                  label={`Пункт ${i + 1}`}
                  name={`trust_${i}`}
                  defaultValue={hero.trustPoints[i] ?? ""}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Статистика (3 колонки)</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Кол.1 значение" name="stat1Val" defaultValue={hero.stat1Val} />
              <Field label="Кол.1 подпись" name="stat1Label" defaultValue={hero.stat1Label} />
              <Field label="Кол.2 значение (маркетинг)" name="stat2MarketingVal" defaultValue={hero.stat2MarketingVal} />
              <Field label="Кол.2 подпись" name="stat2Label" defaultValue={hero.stat2Label} />
              <Field label="Кол.3 значение" name="stat3Val" defaultValue={hero.stat3Val} />
              <Field label="Кол.3 подпись" name="stat3Label" defaultValue={hero.stat3Label} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="kp_wa">Текст для WhatsApp (первичная кнопка КП)</Label>
              <Textarea id="kp_wa" name="kpWhatsAppMessage" rows={2} defaultValue={hero.kpWhatsAppMessage} />
            </div>
            <Field
              label="Карусель в герое — подпись «Витрина»"
              name="heroShowcaseRibbonLabel"
              defaultValue={hero.heroShowcaseRibbonLabel}
            />
            <Field label="Блок «Популярные» — eyebrow" name="featuredEyebrow" defaultValue={hero.featuredEyebrow} />
            <Field label="Блок «Популярные» — заголовок" name="featuredTitle" defaultValue={hero.featuredTitle} />
            <Field
              label="Ссылка «Все N…» (шаблон)"
              name="featuredLinkTemplate"
              defaultValue={hero.featuredLinkTemplate}
            />
            <p className="text-xs text-muted-foreground">
              В шаблоне ссылки на каталог можно подставить число позиций — вставьте{" "}
              <code className="rounded bg-muted px-1">{"{{COUNT}}"}</code>.
            </p>
            <AdminFormFooter previewHref="/" saveLabel="Сохранить баннер" />
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Подборка товаров на главной</CardTitle>
          <CardDescription>
            Укажите адреса товаров из каталога (часть URL после /catalog/). По одному на строку или через
            запятую — до 12 позиций в каждом списке.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={saveHomeProductShowcasesAction} className="max-w-3xl space-y-4">
            <div className="space-y-1">
              <Label htmlFor="heroProductSlugs">Карусель рядом с баннером</Label>
              <Textarea
                id="heroProductSlugs"
                name="heroProductSlugs"
                rows={6}
                defaultValue={productShowcases.heroProductSlugs.join("\n")}
                className="font-mono text-xs sm:text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="catalogHitSlugs">Блок «Хиты каталога» ниже по странице</Label>
              <Textarea
                id="catalogHitSlugs"
                name="catalogHitSlugs"
                rows={7}
                defaultValue={productShowcases.catalogHitSlugs.join("\n")}
                className="font-mono text-xs sm:text-sm"
              />
            </div>
            <AdminFormFooter previewHref="/" saveLabel="Сохранить подборку" />
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Блок «Хиты каталога»</CardTitle>
          <CardDescription>Секция под героем с каруселью хитов.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={saveHomeCategoriesAction} className="grid max-w-3xl gap-3">
            <Field label="Метка над заголовком" name="sectionEyebrow" defaultValue={homeCategories.sectionEyebrow} />
            <Field label="Заголовок блока" name="sectionTitle" defaultValue={homeCategories.sectionTitle} />
            <div className="space-y-1">
              <Label htmlFor="hc_lead">Лид</Label>
              <Textarea id="hc_lead" name="sectionLead" rows={3} defaultValue={homeCategories.sectionLead} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Кнопка справа" name="sectionCtaLabel" defaultValue={homeCategories.sectionCtaLabel} />
              <Field label="Ссылка кнопки" name="sectionCtaHref" defaultValue={homeCategories.sectionCtaHref} />
            </div>
            <Field label="Метка над каруселью" name="carouselEyebrow" defaultValue={homeCategories.carouselEyebrow} />
            <Field label="Заголовок карусели товаров" name="carouselTitle" defaultValue={homeCategories.carouselTitle} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Вторая кнопка в карусели" name="carouselLinkLabel" defaultValue={homeCategories.carouselLinkLabel} />
              <Field label="Ссылка второй кнопки" name="carouselLinkHref" defaultValue={homeCategories.carouselLinkHref} />
            </div>
            <Field
              label="Бейдж «Часто запрашивают»"
              name="carouselBadgeLabel"
              defaultValue={homeCategories.carouselBadgeLabel}
            />
            <AdminFormFooter previewHref="/" saveLabel="Сохранить блок" />
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Текст под баннером</CardTitle>
          <CardDescription>
            Подстановка <code>{"{{COMPANY}}"}</code> заменится на название компании в тексте.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={saveTrustStripAction} className="max-w-3xl space-y-3">
            <div className="space-y-1">
              <Label htmlFor="trust_p">Абзац</Label>
              <Textarea
                id="trust_p"
                name="paragraph"
                rows={4}
                defaultValue={trust.paragraph}
                className="text-sm"
              />
            </div>
            <AdminFormFooter previewHref="/" saveLabel="Сохранить текст" />
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Преимущества</CardTitle>
          <CardDescription>До восьми карточек. Пиктограммы слева задаются дизайном сайта и не меняются здесь.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={saveHomeWhyUsAction} className="max-w-3xl space-y-4">
            <Field label="Метка над заголовком" name="sectionEyebrow" defaultValue={homeWhyUs.sectionEyebrow} />
            <Field label="Заголовок" name="sectionTitle" defaultValue={homeWhyUs.sectionTitle} />
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-3">
                <Field label={`Метрика ${i + 1}`} name={`metric_${i}`} defaultValue={homeWhyUs.items[i]?.metric ?? ""} />
                <Field label={`Заголовок ${i + 1}`} name={`title_${i}`} defaultValue={homeWhyUs.items[i]?.title ?? ""} />
                <div className="space-y-1 sm:col-span-3">
                  <Label>Описание {i + 1}</Label>
                  <Textarea name={`desc_${i}`} rows={2} defaultValue={homeWhyUs.items[i]?.desc ?? ""} className="text-sm" />
                </div>
              </div>
            ))}
            <AdminFormFooter previewHref="/" saveLabel="Сохранить преимущества" />
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Кому поставляем</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={saveHomeWhoWeSupplyAction} className="max-w-3xl space-y-3">
            <Field label="Метка над заголовком" name="sectionEyebrow" defaultValue={homeWhoWeSupply.sectionEyebrow} />
            <Field label="Заголовок" name="sectionTitle" defaultValue={homeWhoWeSupply.sectionTitle} />
            <div className="space-y-1">
              <Label htmlFor="wws_lead">Лид</Label>
              <Textarea id="wws_lead" name="sectionLead" rows={3} defaultValue={homeWhoWeSupply.sectionLead} />
            </div>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-2">
                <Field label={`Заголовок ${i + 1}`} name={`seg_title_${i}`} defaultValue={homeWhoWeSupply.segments[i]?.title ?? ""} />
                <div className="space-y-1 sm:col-span-2">
                  <Label>Текст {i + 1}</Label>
                  <Textarea name={`seg_text_${i}`} rows={2} defaultValue={homeWhoWeSupply.segments[i]?.text ?? ""} />
                </div>
              </div>
            ))}
            <AdminFormFooter previewHref="/" saveLabel="Сохранить блок" />
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Как мы работаем</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={saveHomeHowItWorksAction} className="max-w-3xl space-y-3">
            <Field label="Метка над заголовком" name="sectionEyebrow" defaultValue={homeHowItWorks.sectionEyebrow} />
            <Field label="Заголовок" name="sectionTitle" defaultValue={homeHowItWorks.sectionTitle} />
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-3">
                <Field label={`№ ${i + 1}`} name={`step_num_${i}`} defaultValue={homeHowItWorks.steps[i]?.num ?? ""} />
                <Field label={`Заголовок ${i + 1}`} name={`step_title_${i}`} defaultValue={homeHowItWorks.steps[i]?.title ?? ""} />
                <div className="space-y-1 sm:col-span-3">
                  <Label>Описание {i + 1}</Label>
                  <Textarea name={`step_desc_${i}`} rows={2} defaultValue={homeHowItWorks.steps[i]?.desc ?? ""} />
                </div>
              </div>
            ))}
            <AdminFormFooter previewHref="/#how-it-works" saveLabel="Сохранить этапы" />
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Кейсы и примеры поставок</CardTitle>
          <CardDescription>До 12 кейсов. Пустые блоки пропускаются.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={saveHomeDeliveryCaseAction} className="max-w-3xl space-y-4">
            <Field label="Eyebrow" name="sectionEyebrow" defaultValue={homeDeliveryCase.sectionEyebrow} />
            <Field label="Заголовок" name="sectionTitle" defaultValue={homeDeliveryCase.sectionTitle} />
            <div className="space-y-1">
              <Label htmlFor="dc_lead">Лид</Label>
              <Textarea id="dc_lead" name="sectionLead" rows={2} defaultValue={homeDeliveryCase.sectionLead} />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Метка «Комплект»" name="kitMetaLabel" defaultValue={homeDeliveryCase.kitMetaLabel} />
              <Field label="Метка «Объект»" name="objectMetaLabel" defaultValue={homeDeliveryCase.objectMetaLabel} />
              <Field label="Префикс результата" name="resultPrefix" defaultValue={homeDeliveryCase.resultPrefix} />
            </div>
            <p className="text-xs text-muted-foreground">Сводка справа от заголовка</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Значение 1" name="summaryCasesValue" defaultValue={homeDeliveryCase.summaryCasesValue} />
              <Field label="Подпись 1" name="summaryCasesLabel" defaultValue={homeDeliveryCase.summaryCasesLabel} />
              <Field label="Значение 2" name="summaryDaysValue" defaultValue={homeDeliveryCase.summaryDaysValue} />
              <Field label="Подпись 2" name="summaryDaysLabel" defaultValue={homeDeliveryCase.summaryDaysLabel} />
              <Field label="Значение 3" name="summaryUnitsValue" defaultValue={homeDeliveryCase.summaryUnitsValue} />
              <Field label="Подпись 3" name="summaryUnitsLabel" defaultValue={homeDeliveryCase.summaryUnitsLabel} />
            </div>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="grid gap-2 rounded-lg border border-border p-3">
                <Field label={`Кейс ${i + 1} — заголовок`} name={`case_title_${i}`} defaultValue={homeDeliveryCase.cases[i]?.title ?? ""} />
                <div className="space-y-1">
                  <Label>Текст</Label>
                  <Textarea name={`case_text_${i}`} rows={2} defaultValue={homeDeliveryCase.cases[i]?.text ?? ""} />
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  <Field label="Комплект" name={`case_positions_${i}`} defaultValue={homeDeliveryCase.cases[i]?.positions ?? ""} />
                  <Field label="Срок" name={`case_term_${i}`} defaultValue={homeDeliveryCase.cases[i]?.term ?? ""} />
                  <Field label="Подпись срока" name={`case_termLabel_${i}`} defaultValue={homeDeliveryCase.cases[i]?.termLabel ?? ""} />
                  <Field label="Объект (шапка)" name={`case_object_${i}`} defaultValue={homeDeliveryCase.cases[i]?.object ?? ""} />
                  <div className="space-y-1 sm:col-span-2">
                    <Label>Результат</Label>
                    <Textarea name={`case_result_${i}`} rows={2} defaultValue={homeDeliveryCase.cases[i]?.result ?? ""} />
                  </div>
                </div>
              </div>
            ))}
            <AdminFormFooter previewHref="/" saveLabel="Сохранить кейсы" />
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Форма заявки внизу главной</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={saveRequestCtaAction} className="max-w-3xl space-y-3">
            <Field label="Заголовок" name="title" defaultValue={rcta.title} />
            <div className="space-y-1">
              <Label htmlFor="rcta_sub">Подзаголовок</Label>
              <Textarea id="rcta_sub" name="subtitle" rows={3} defaultValue={rcta.subtitle} />
            </div>
            <Field label="Строка под формой" name="footerHint" defaultValue={rcta.footerHint} />
            <AdminFormFooter previewHref="/#request-section" saveLabel="Сохранить блок" />
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Вопросы и ответы</CardTitle>
          <CardDescription>До 8 пар вопрос–ответ; пустые строки пропускаются.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={saveHomeFaqAction} className="max-w-3xl space-y-4">
            <Field label="Метка над заголовком" name="sectionEyebrow" defaultValue={faq.sectionEyebrow} />
            <Field label="Заголовок секции" name="sectionTitle" defaultValue={faq.sectionTitle} />
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>Вопрос {i + 1}</Label>
                  <input
                    name={`faq_q_${i}`}
                    defaultValue={faq.items[i]?.q ?? ""}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label>Ответ {i + 1}</Label>
                  <Textarea name={`faq_a_${i}`} rows={3} defaultValue={faq.items[i]?.a ?? ""} className="text-sm" />
                </div>
              </div>
            ))}
            <AdminFormFooter previewHref="/#faq" saveLabel="Сохранить вопросы" />
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Как главная выглядит в поиске и соцсетях</CardTitle>
          <CardDescription>
            Заголовок и описание для Google и при расшаривании ссылки (не видно посетителям на самой странице).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={saveHomeMetaAction} className="max-w-3xl space-y-3">
            <Field label="Заголовок для поиска" name="ogTitle" defaultValue={meta.ogTitle} />
            <div className="space-y-1">
              <Label htmlFor="ogd">Краткое описание</Label>
              <Textarea id="ogd" name="ogDescription" rows={3} defaultValue={meta.ogDescription} />
            </div>
            <p className="text-xs text-muted-foreground">
              По умолчанию (без БД):{" "}
              <code className="rounded bg-muted px-1">{defaultHomeMeta(COMPANY.name).ogTitle}</code>
            </p>
            <AdminFormFooter previewHref="/" saveLabel="Сохранить описание для поиска" />
          </form>
        </CardContent>
      </Card>
      </ContentSection>

      <ContentSection
        title="О компании"
        description="Страница «О компании» в меню сайта и то, как она выглядит в поиске Google и при расшаривании."
      >
      <Card>
        <CardHeader>
          <CardTitle>Как сайт выглядит в поиске</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={saveAboutMetaAction} className="max-w-3xl space-y-3">
            <Field label="Заголовок вкладки браузера" name="title" defaultValue={aboutMeta.title} />
            <div className="space-y-1">
              <Label htmlFor="about_meta_desc">Краткое описание для поиска</Label>
              <Textarea
                id="about_meta_desc"
                name="description"
                rows={3}
                defaultValue={aboutMeta.description}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              По умолчанию (без БД):{" "}
              <code className="rounded bg-muted px-1">{defaultAboutMeta(COMPANY.name).title}</code>
            </p>
            <AdminFormFooter previewHref="/about" saveLabel="Сохранить описание для поиска" />
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Тексты на странице</CardTitle>
          <CardDescription>
            <code>{"{{COMPANY}}"}</code> в текстах; в строке под «Что мы поставляем» —{" "}
            <code>{"{{CAT}}"}</code> и <code>{"{{PROD}}"}</code>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={saveAboutCopyAction} className="max-w-3xl space-y-3">
            <div className="space-y-1">
              <Label htmlFor="about_lead">Лид под заголовком</Label>
              <Textarea id="about_lead" name="headerLead" rows={2} defaultValue={about.headerLead} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="about_ov">«Кто мы» — абзацы через пустую строку</Label>
              <Textarea
                id="about_ov"
                name="overview"
                rows={10}
                defaultValue={about.overviewParagraphs.join("\n\n")}
                className="font-mono text-xs sm:text-sm"
              />
            </div>
            <Field
              label="Строка под «Что мы поставляем»"
              name="productGroupsLine"
              defaultValue={about.productGroupsLine}
            />
            <Field label="CTA — заголовок" name="ctaTitle" defaultValue={about.ctaTitle} />
            <div className="space-y-1">
              <Label htmlFor="about_cta_sub">CTA — текст</Label>
              <Textarea id="about_cta_sub" name="ctaSubtitle" rows={3} defaultValue={about.ctaSubtitle} />
            </div>
            <AdminFormFooter previewHref="/about" saveLabel="Сохранить текст страницы" />
          </form>
        </CardContent>
      </Card>
      </ContentSection>

      <ContentSection
        title="Контакты"
        description="Страница с формой обратной связи: тексты и заголовок для поиска."
      >
      <Card>
        <CardHeader>
          <CardTitle>Как страница выглядит в поиске</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={saveContactsMetaAction} className="max-w-3xl space-y-3">
            <Field label="Заголовок вкладки браузера" name="title" defaultValue={contactsMeta.title} />
            <div className="space-y-1">
              <Label htmlFor="contacts_meta_desc">Краткое описание для поиска</Label>
              <Textarea
                id="contacts_meta_desc"
                name="description"
                rows={3}
                defaultValue={contactsMeta.description}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              По умолчанию (без БД):{" "}
              <code className="rounded bg-muted px-1">
                {defaultContactsMeta({
                  companyName: COMPANY.name,
                  phoneDisplay: COMPANY.phoneDisplay,
                  email: COMPANY.email,
                  city: COMPANY.address.city,
                }).title}
              </code>
            </p>
            <AdminFormFooter previewHref="/contacts" saveLabel="Сохранить описание для поиска" />
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Тексты рядом с формой</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={saveContactsCopyAction} className="max-w-3xl space-y-3">
            <div className="space-y-1">
              <Label htmlFor="c_lead">Под заголовком страницы</Label>
              <Textarea id="c_lead" name="pageLead" rows={2} defaultValue={contacts.pageLead} />
            </div>
            <Field label="Заголовок над формой" name="formTitle" defaultValue={contacts.formTitle} />
            <div className="space-y-1">
              <Label htmlFor="c_help">Текст под заголовком формы</Label>
              <Textarea id="c_help" name="formHelper" rows={2} defaultValue={contacts.formHelper} />
            </div>
            <AdminFormFooter previewHref="/contacts" saveLabel="Сохранить тексты" />
          </form>
        </CardContent>
      </Card>
      </ContentSection>

      <ContentSection
        title="Статические страницы (site.page.*)"
        description="Полные наборы текстов и SEO для публичных страниц. Мета «старых» блоков (например site.meta.about) подмешивается, пока не задано в этих формах. Плейсхолдеры: {{COMPANY}}, {{LEGAL_NAME}}, {{BRAND}}, {{ADDRESS_FULL}}, {{CITY}}, {{STREET}} (по полю)."
      >
        <Card>
          <CardHeader>
            <CardTitle>/about — site.page.about</CardTitle>
            <CardDescription>
              SEO, заголовки секций, преимущества (4), карточки B2B (3), чипы стандартов (до 4 строк в форме),
              статистика (виды значений: marketing / categories / literal).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={savePageAboutAction} className="max-w-3xl space-y-4">
              <Field label="Meta title" name="metaTitle" defaultValue={pageAbout.metaTitle} />
              <div className="space-y-1">
                <Label htmlFor="about_page_meta_desc">Meta description</Label>
                <Textarea
                  id="about_page_meta_desc"
                  name="metaDescription"
                  rows={3}
                  defaultValue={pageAbout.metaDescription}
                />
              </div>
              <Field label="Хлебные крошки (текущая)" name="breadcrumbCurrent" defaultValue={pageAbout.breadcrumbCurrent} />
              <Field label="H1 шаблон" name="h1Template" defaultValue={pageAbout.h1Template} />
              <Field label="Заголовок «Кто мы»" name="whoWeTitle" defaultValue={pageAbout.whoWeTitle} />
              <Field label="Заголовок «Что мы поставляем»" name="whatWeSupplyTitle" defaultValue={pageAbout.whatWeSupplyTitle} />
              <Field label="Ссылка в каталог" name="catalogLinkLabel" defaultValue={pageAbout.catalogLinkLabel} />
              <Field
                label="Заголовок преимуществ (шаблон)"
                name="whyChooseTitleTemplate"
                defaultValue={pageAbout.whyChooseTitleTemplate}
              />
              <Field label="Eyebrow стандартов" name="standardsEyebrow" defaultValue={pageAbout.standardsEyebrow} />
              <p className="text-xs text-muted-foreground">Преимущества (4 блока)</p>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="grid gap-2 rounded-lg border border-border p-3">
                  <Field label={`Заголовок ${i + 1}`} name={`adv_title_${i}`} defaultValue={pageAbout.advantages[i]?.title ?? ""} />
                  <div className="space-y-1">
                    <Label>Текст {i + 1}</Label>
                    <Textarea name={`adv_desc_${i}`} rows={2} defaultValue={pageAbout.advantages[i]?.description ?? ""} />
                  </div>
                </div>
              ))}
              <p className="text-xs text-muted-foreground">Карточки B2B (3)</p>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="grid gap-2 rounded-lg border border-border p-3">
                  <Field label={`Заголовок ${i + 1}`} name={`b2b_title_${i}`} defaultValue={pageAbout.b2bCards[i]?.title ?? ""} />
                  <div className="space-y-1">
                    <Label>Текст {i + 1}</Label>
                    <Textarea name={`b2b_text_${i}`} rows={2} defaultValue={pageAbout.b2bCards[i]?.text ?? ""} />
                  </div>
                </div>
              ))}
              <p className="text-xs text-muted-foreground">Чипы сертификатов / стандартов (4 строки)</p>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="grid gap-2 sm:grid-cols-2">
                  <Field label={`Метка ${i + 1}`} name={`cert_label_${i}`} defaultValue={pageAbout.certifications[i]?.label ?? ""} />
                  <Field label={`Подпись ${i + 1}`} name={`cert_sub_${i}`} defaultValue={pageAbout.certifications[i]?.sub ?? ""} />
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                Статистика: kind = marketing (700+), categories (число категорий), literal (ручное значение).
              </p>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-3">
                  <Field
                    label={`Слот ${i + 1} kind`}
                    name={`stat_kind_${i}`}
                    defaultValue={pageAbout.statSlots[i]?.valueKind ?? "literal"}
                  />
                  <Field
                    label={`Слот ${i + 1} literal`}
                    name={`stat_lit_${i}`}
                    defaultValue={pageAbout.statSlots[i]?.valueLiteral ?? ""}
                  />
                  <Field label={`Слот ${i + 1} подпись`} name={`stat_lab_${i}`} defaultValue={pageAbout.statSlots[i]?.label ?? ""} />
                </div>
              ))}
              <Field label="Кнопка каталога (низ страницы)" name="ctaCatalogLabel" defaultValue={pageAbout.ctaCatalogLabel} />
              <Field label="Кнопка контактов" name="ctaContactsLabel" defaultValue={pageAbout.ctaContactsLabel} />
              <Field label="Изображение в шапке (URL или путь)" name="headerImageSrc" defaultValue={pageAbout.headerImageSrc} />
              <AdminFormFooter previewHref="/about" saveLabel="Сохранить страницу «О компании»" />
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>/contacts — site.page.contacts</CardTitle>
            <CardDescription>
              Объединяется с текстами формы и meta из блоков выше. Подписи реквизитов задаются по строкам.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={savePageContactsAction} className="max-w-3xl space-y-3">
              <Field label="Meta title" name="metaTitle" defaultValue={pageContacts.metaTitle} />
              <div className="space-y-1">
                <Label>Meta description</Label>
                <Textarea name="metaDescription" rows={3} defaultValue={pageContacts.metaDescription} />
              </div>
              <Field label="Хлебные крошки" name="breadcrumbLabel" defaultValue={pageContacts.breadcrumbLabel} />
              <Field label="H1" name="h1" defaultValue={pageContacts.h1} />
              <div className="space-y-1">
                <Label>Лид под заголовком</Label>
                <Textarea name="pageLead" rows={2} defaultValue={pageContacts.pageLead} />
              </div>
              <Field label="Заголовок формы" name="formTitle" defaultValue={pageContacts.formTitle} />
              <div className="space-y-1">
                <Label>Подсказка формы</Label>
                <Textarea name="formHelper" rows={2} defaultValue={pageContacts.formHelper} />
              </div>
              <p className="text-xs text-muted-foreground">Подписи карточек (телефон, почта, адрес, время)</p>
              {Array.from({ length: 4 }).map((_, i) => (
                <Field
                  key={i}
                  label={`Карточка ${i + 1}`}
                  name={`card_lab_${i}`}
                  defaultValue={pageContacts.contactCardLabels[i] ?? ""}
                />
              ))}
              <Field label="Время — строка 1" name="workLine1" defaultValue={pageContacts.workLine1} />
              <Field label="Время — строка 2" name="workLine2" defaultValue={pageContacts.workLine2} />
              <Field label="Подпись ссылки на карту (2GIS)" name="mapLinkLabel" defaultValue={pageContacts.mapLinkLabel} />
              <Field label="WhatsApp карточка — заголовок" name="whatsAppTitle" defaultValue={pageContacts.whatsAppTitle} />
              <Field label="WhatsApp карточка — подзаголовок" name="whatsAppSubtitle" defaultValue={pageContacts.whatsAppSubtitle} />
              <Field label="Заголовок блока карты" name="mapSectionTitle" defaultValue={pageContacts.mapSectionTitle} />
              <Field label="Eyebrow на карте (офис)" name="mapPinEyebrow" defaultValue={pageContacts.mapPinEyebrow} />
              <Field label="Шаблон города" name="mapCityLineTemplate" defaultValue={pageContacts.mapCityLineTemplate} />
              <Field label="Шаблон улицы" name="mapStreetLineTemplate" defaultValue={pageContacts.mapStreetLineTemplate} />
              <Field label="Кнопка открыть карту" name="mapOpenLabel" defaultValue={pageContacts.mapOpenLabel} />
              <Field
                label="Нижний адрес (шаблон)"
                name="mapBottomAddressLineTemplate"
                defaultValue={pageContacts.mapBottomAddressLineTemplate}
              />
              <Field label="Префикс «Карта:»" name="mapBottomMapPrefix" defaultValue={pageContacts.mapBottomMapPrefix} />
              <Field label="Текст ссылки 2GIS" name="mapBottomMapLinkLabel" defaultValue={pageContacts.mapBottomMapLinkLabel} />
              <Field label="Фон блока карты (URL)" name="mapBackgroundImageSrc" defaultValue={pageContacts.mapBackgroundImageSrc} />
              <Field label="Заголовок реквизитов" name="requisitesTitle" defaultValue={pageContacts.requisitesTitle} />
              {Array.from({ length: 5 }).map((_, i) => (
                <Field
                  key={i}
                  label={`Подпись строки реквизитов ${i + 1}`}
                  name={`req_lab_${i}`}
                  defaultValue={pageContacts.requisitesRowLabels[i] ?? ""}
                />
              ))}
              <div className="space-y-1">
                <Label>Примечание под таблицей</Label>
                <Textarea name="requisitesFooterNote" rows={2} defaultValue={pageContacts.requisitesFooterNote} />
              </div>
              <AdminFormFooter previewHref="/contacts" saveLabel="Сохранить страницу «Контакты»" />
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>/delivery — site.page.delivery</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={savePageDeliveryAction} className="max-w-3xl space-y-3">
              <Field label="Meta title" name="metaTitle" defaultValue={pageDelivery.metaTitle} />
              <div className="space-y-1">
                <Label>Meta description</Label>
                <Textarea name="metaDescription" rows={3} defaultValue={pageDelivery.metaDescription} />
              </div>
              <div className="space-y-1">
                <Label>Open Graph description</Label>
                <Textarea name="ogDescription" rows={2} defaultValue={pageDelivery.ogDescription} />
              </div>
              <div className="space-y-1">
                <Label>Twitter description</Label>
                <Textarea name="twitterDescription" rows={2} defaultValue={pageDelivery.twitterDescription} />
              </div>
              <Field label="Eyebrow" name="eyebrow" defaultValue={pageDelivery.eyebrow} />
              <Field label="H1" name="h1" defaultValue={pageDelivery.h1} />
              <div className="space-y-1">
                <Label>Лид</Label>
                <Textarea name="lead" rows={3} defaultValue={pageDelivery.lead} />
              </div>
              <Field label="Коллаут — вступление" name="calloutIntro" defaultValue={pageDelivery.calloutIntro} />
              <Field label="Коллаут — город (жирным)" name="calloutCityLabel" defaultValue={pageDelivery.calloutCityLabel} />
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <Label>Буллет {i + 1}</Label>
                  <Textarea name={`bullet_${i}`} rows={2} defaultValue={pageDelivery.bullets[i]?.text ?? ""} />
                </div>
              ))}
              <Field label="Строка с галочкой" name="footerCheckLine" defaultValue={pageDelivery.footerCheckLine} />
              <Field label="Кнопка заявки" name="ctaPrimaryLabel" defaultValue={pageDelivery.ctaPrimaryLabel} />
              <Field label="Кнопка контактов" name="ctaSecondaryLabel" defaultValue={pageDelivery.ctaSecondaryLabel} />
              <Field label="Изображение на странице (URL)" name="pageImageSrc" defaultValue={pageDelivery.pageImageSrc} />
              <AdminFormFooter previewHref="/delivery" saveLabel="Сохранить «Доставку»" />
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>/certificates — site.page.certificates</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={savePageCertificatesAction} className="max-w-3xl space-y-3">
              <Field label="Meta title" name="metaTitle" defaultValue={pageCertificates.metaTitle} />
              <div className="space-y-1">
                <Label>Meta description</Label>
                <Textarea name="metaDescription" rows={3} defaultValue={pageCertificates.metaDescription} />
              </div>
              <div className="space-y-1">
                <Label>OG description</Label>
                <Textarea name="ogDescription" rows={2} defaultValue={pageCertificates.ogDescription} />
              </div>
              <div className="space-y-1">
                <Label>Twitter description</Label>
                <Textarea name="twitterDescription" rows={2} defaultValue={pageCertificates.twitterDescription} />
              </div>
              <Field label="Хлебные крошки" name="breadcrumbLabel" defaultValue={pageCertificates.breadcrumbLabel} />
              <Field label="H1" name="h1" defaultValue={pageCertificates.h1} />
              <div className="space-y-1">
                <Label>Лид</Label>
                <Textarea name="lead" rows={2} defaultValue={pageCertificates.lead} />
              </div>
              <Field label="Пустое состояние — заголовок" name="emptyTitle" defaultValue={pageCertificates.emptyTitle} />
              <div className="space-y-1">
                <Label>Пустое состояние — текст</Label>
                <Textarea name="emptySubtitle" rows={2} defaultValue={pageCertificates.emptySubtitle} />
              </div>
              <Field label="Подпись даты в карточке" name="issuedAtLabel" defaultValue={pageCertificates.issuedAtLabel} />
              <Field label="Кнопка «Открыть документ»" name="openDocumentLabel" defaultValue={pageCertificates.openDocumentLabel} />
              <Field label="Изображение в шапке (URL)" name="headerImageSrc" defaultValue={pageCertificates.headerImageSrc} />
              <AdminFormFooter previewHref="/certificates" saveLabel="Сохранить «Сертификаты»" />
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>/privacy — site.page.privacy</CardTitle>
            <CardDescription>
              Вступление — абзацы через пустую строку. Секции: для каждой строки таблицы укажите заголовок; тело — абзацы через
              пустую строку; маркеры — по одной строке.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={savePagePrivacyAction} className="max-w-3xl space-y-3">
              <Field label="Meta title" name="metaTitle" defaultValue={pagePrivacy.metaTitle} />
              <div className="space-y-1">
                <Label>Meta description</Label>
                <Textarea name="metaDescription" rows={3} defaultValue={pagePrivacy.metaDescription} />
              </div>
              <div className="space-y-1">
                <Label>OG description</Label>
                <Textarea name="ogDescription" rows={2} defaultValue={pagePrivacy.ogDescription} />
              </div>
              <div className="space-y-1">
                <Label>Twitter description</Label>
                <Textarea name="twitterDescription" rows={2} defaultValue={pagePrivacy.twitterDescription} />
              </div>
              <Field label="Хлебные крошки" name="breadcrumbLabel" defaultValue={pagePrivacy.breadcrumbLabel} />
              <Field label="H1" name="h1" defaultValue={pagePrivacy.h1} />
              <Field label="Подзаголовок (шаблон)" name="subtitleTemplate" defaultValue={pagePrivacy.subtitleTemplate} />
              <div className="space-y-1">
                <Label>Вступление (абзацы через пустую строку)</Label>
                <Textarea
                  name="introParagraphs"
                  rows={6}
                  className="font-mono text-xs sm:text-sm"
                  defaultValue={pagePrivacy.introParagraphs.join("\n\n")}
                />
              </div>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="space-y-2 rounded-lg border border-border p-3">
                  <Field label={`Секция ${i + 1} — H2`} name={`sec_h_${i}`} defaultValue={pagePrivacy.sections[i]?.heading ?? ""} />
                  <div className="space-y-1">
                    <Label>Тело (абзацы через пустую строку)</Label>
                    <Textarea
                      name={`sec_body_${i}`}
                      rows={4}
                      defaultValue={pagePrivacy.sections[i]?.bodyParagraphs.join("\n\n") ?? ""}
                      className="font-mono text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Список (необязательно, строки)</Label>
                    <Textarea
                      name={`sec_bullets_${i}`}
                      rows={3}
                      defaultValue={pagePrivacy.sections[i]?.bullets?.join("\n") ?? ""}
                      className="font-mono text-xs"
                    />
                  </div>
                </div>
              ))}
              <Field
                label="Контакты по данным — заголовок H2"
                name="contact_section_heading"
                defaultValue={pagePrivacy.contact.sectionHeading}
              />
              <div className="space-y-1">
                <Label>Вводный абзац контактов</Label>
                <Textarea name="contact_intro" rows={2} defaultValue={pagePrivacy.contact.intro} />
              </div>
              <div className="space-y-1">
                <Label>Заключительный абзац (адрес)</Label>
                <Textarea name="contact_outro" rows={2} defaultValue={pagePrivacy.contact.outro} />
              </div>
              <AdminFormFooter previewHref="/privacy" saveLabel="Сохранить политику" />
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>/terms — site.page.terms</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={savePageTermsAction} className="max-w-3xl space-y-3">
              <Field label="Meta title" name="metaTitle" defaultValue={pageTerms.metaTitle} />
              <div className="space-y-1">
                <Label>Meta description</Label>
                <Textarea name="metaDescription" rows={3} defaultValue={pageTerms.metaDescription} />
              </div>
              <Field label="H1" name="h1" defaultValue={pageTerms.h1} />
              <div className="space-y-1">
                <Label>Абзац 1 — до ссылки на политику</Label>
                <Textarea name="introBeforePrivacyLink" rows={2} defaultValue={pageTerms.introBeforePrivacyLink} />
              </div>
              <Field label="Текст ссылки на /privacy" name="privacyLinkLabel" defaultValue={pageTerms.privacyLinkLabel} />
              <div className="space-y-1">
                <Label>Абзац 1 — после ссылки</Label>
                <Textarea name="introAfterPrivacyLink" rows={2} defaultValue={pageTerms.introAfterPrivacyLink} />
              </div>
              <div className="space-y-1">
                <Label>Второй абзац</Label>
                <Textarea name="paragraph2" rows={3} defaultValue={pageTerms.paragraph2} />
              </div>
              <div className="space-y-1">
                <Label>Плейсхолдеры контактной строки: {"{{EMAIL}}"}, {"{{PHONE_DISPLAY}}"}, {"{{BRAND}}"}</Label>
                <Textarea name="contactLine" rows={2} defaultValue={pageTerms.contactLine} />
              </div>
              <AdminFormFooter previewHref="/terms" saveLabel="Сохранить условия" />
            </form>
          </CardContent>
        </Card>
      </ContentSection>

      <ContentSection
        title="Подвал сайта"
        description="Нижняя часть каждой страницы: призыв связаться, полоска преимуществ и колонки со ссылками."
      >
      <Card>
        <CardHeader>
          <CardTitle>Призыв перед основным подвалом</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={saveFooterPreCtaAction} className="max-w-3xl space-y-3">
            <Field label="Заголовок" name="title" defaultValue={footerPreCta.title} />
            <div className="space-y-1">
              <Label htmlFor="fpre_sub">Подзаголовок</Label>
              <Textarea id="fpre_sub" name="subtitle" rows={2} defaultValue={footerPreCta.subtitle} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="WhatsApp — основная строка" name="whatsappPrimary" defaultValue={footerPreCta.whatsappPrimary} />
              <Field label="WhatsApp — вторая строка" name="whatsappSecondary" defaultValue={footerPreCta.whatsappSecondary} />
              <Field label="Почта — основная строка" name="emailPrimary" defaultValue={footerPreCta.emailPrimary} />
              <Field label="Почта — вторая строка" name="emailSecondary" defaultValue={footerPreCta.emailSecondary} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="fpre_wa">Текст префилла WhatsApp для КП</Label>
              <Textarea id="fpre_wa" name="kpWhatsAppMessage" rows={2} defaultValue={footerPreCta.kpWhatsAppMessage} />
            </div>
            <AdminFormFooter previewHref="/" saveLabel="Сохранить блок" />
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Полоска с короткими преимуществами</CardTitle>
          <CardDescription>По одному тексту на строку. Порядок совпадает с иконками на сайте.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={saveFooterTrustBarAction} className="max-w-3xl space-y-3">
            <div className="space-y-1">
              <Label htmlFor="ftrust_items">Строки</Label>
              <Textarea id="ftrust_items" name="items" rows={8} defaultValue={footerTrust.items.join("\n")} />
            </div>
            <AdminFormFooter previewHref="/" saveLabel="Сохранить строки" />
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Колонки ссылок и контакты внизу страницы</CardTitle>
          <CardDescription>
            Адрес логотипа: полный URL или путь к файлу в разделе «Файлы сайта», например{" "}
            <code className="rounded bg-muted px-1">/images/logo.png</code>. Если поле пустое — показывается знак по
            умолчанию. Каждая строка списка ссылок: подпись, символ «|», затем адрес страницы.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={saveFooterMainAction} className="max-w-3xl space-y-3">
            <Field label="Текст под логотипом" name="brandTagline" defaultValue={footerMain.brandTagline} />
            <Field
              label="Логотип (URL или /images/...)"
              name="brandLogoSrc"
              defaultValue={footerMain.brandLogoSrc}
            />
            <Field label="Юридическое наименование (строка)" name="legalNameLine" defaultValue={footerMain.legalNameLine} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Адрес (подвал)" name="addressLine" defaultValue={footerMain.addressLine} />
              <Field label="Часы работы" name="workHoursLine" defaultValue={footerMain.workHoursLine} />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Заголовок колонки «Каталог»" name="catalogHeading" defaultValue={footerMain.catalogHeading} />
              <Field label="Заголовок «Компания»" name="companyHeading" defaultValue={footerMain.companyHeading} />
              <Field label="Заголовок контактов" name="contactHeading" defaultValue={footerMain.contactHeading} />
            </div>
            <Field label="Кнопка WhatsApp" name="whatsappButtonLabel" defaultValue={footerMain.whatsappButtonLabel} />
            <Field label="Нижняя строка © (плейсхолдер {{YEAR}})" name="bottomCopyright" defaultValue={footerMain.bottomCopyright} />
            <Field label="Центральная строка низа" name="bottomTagline" defaultValue={footerMain.bottomTagline} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Ссылка «Условия»" name="termsLabel" defaultValue={footerMain.termsLabel} />
              <Field label="Ссылка «Конфиденциальность»" name="privacyLabel" defaultValue={footerMain.privacyLabel} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="fl_cat">Ссылки каталога</Label>
              <Textarea
                id="fl_cat"
                name="catalogLinks"
                rows={10}
                defaultValue={footerMain.catalogLinks.map((l) => `${l.label}|${l.href}`).join("\n")}
                className="font-mono text-xs sm:text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="fl_co">Ссылки компании</Label>
              <Textarea
                id="fl_co"
                name="companyLinks"
                rows={8}
                defaultValue={footerMain.companyLinks.map((l) => `${l.label}|${l.href}`).join("\n")}
                className="font-mono text-xs sm:text-sm"
              />
            </div>
            <AdminFormFooter previewHref="/" saveLabel="Сохранить подвал" />
          </form>
        </CardContent>
      </Card>
      </ContentSection>

      <details className="rounded-lg border border-dashed border-[#E2E8F0] bg-slate-50/80 p-4 text-xs text-slate-600">
        <summary className="cursor-pointer font-medium text-slate-800">Для разработчиков: сброс к шаблону из кода</summary>
        <p className="mt-2 leading-relaxed">
          Чтобы вернуть заводские тексты из программы, удалите запись в базе для нужного блока или очистите её данные,
          затем снова сохраните форму.
        </p>
      </details>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name} className="text-slate-700">
        {label}
      </Label>
      <input
        id={name}
        name={name}
        defaultValue={defaultValue}
        className="flex h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-slate-900 shadow-sm"
      />
    </div>
  );
}
