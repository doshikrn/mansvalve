# Карта CMS-управления публичными страницами

Дата аудита: 2026-05-18  
Scope: `/`, `/about`, `/contacts`, `/delivery`, `/certificates`, footer, header CTA.  
Цель документа: показать, какие видимые тексты/изображения реально редактируются из админки, а какие остаются в коде или берутся из констант.

Легенда:
- `yes` — поле редактируется в админке и публичная страница читает тот же источник.
- `partial` — часть блока редактируется, часть берется из БД каталога, `lib/company` или захардкожена.
- `no` — видимый текст/изображение не редактируется из админки.
- `mismatch` — админка имеет поле, но публичная страница использует другой источник.

## Карта

| Page | Section | Public component | Content key / source | Admin field | Editable |
| --- | --- | --- | --- | --- | --- |
| `/` | Metadata / SEO | `app/(site)/page.tsx` | `site.meta.home` через `resolveHomeMeta()`, но фактически используются `HOME_SEO_TITLE` / `HOME_SEO_DESCRIPTION` из кода | `Главная → Как главная выглядит в поиске и соцсетях` | mismatch |
| `/` | Hero | `components/sections/Hero.tsx` | `site.home.hero` | `Главная → Главный баннер` | yes |
| `/` | Hero product carousel | `components/sections/Hero.tsx`, `ProductShowcaseCarousel` | `site.home.productShowcases` + public catalog products | `Главная → Подборка товаров на главной` | partial |
| `/` | Trust strip under hero | `components/sections/TrustStrip.tsx` | `site.home.trustStrip` | `Главная → Текст под баннером` | yes |
| `/` | Catalog hits block | `components/sections/Categories.tsx` | `site.home.categories` + `site.home.productShowcases` + catalog products | `Главная → Блок «Хиты каталога»`, `Подборка товаров на главной` | partial |
| `/` | Why us | `components/sections/WhyUs.tsx` | `site.home.whyUs` | `Главная → Преимущества` | yes |
| `/` | Who we supply | `components/sections/WhoWeSupply.tsx` | `site.home.whoWeSupply` | `Главная → Кому поставляем` | yes |
| `/` | How it works | `components/sections/HowItWorks.tsx` | `site.home.howItWorks` | `Главная → Как мы работаем` | yes |
| `/` | Delivery cases | `components/sections/DeliveryCase.tsx` | `site.home.deliveryCase` | `Главная → Кейсы и примеры поставок` | yes |
| `/` | Request CTA | `components/sections/RequestCTA.tsx`, `RequestCtaClient` | `site.home.requestCta`; WhatsApp/email links from `lib/company` | `Главная → Форма заявки внизу главной` | partial |
| `/` | FAQ | `components/sections/FAQ.tsx` | `site.home.faq` | `Главная → Вопросы и ответы` | yes |
| `/about` | Metadata / SEO | `app/(site)/about/page.tsx` | `site.page.about`, with legacy fallback `site.meta.about` | `О компании → Как сайт выглядит в поиске`, `Статические страницы → /about` | yes |
| `/about` | Hero title/lead/image | `components/sections/about/AboutHero.tsx` | `site.page.about` + `site.about.copy` | `О компании → Тексты на странице`, `Изображение в шапке /about`, `Статические страницы → /about` | yes |
| `/about` | Hero eyebrow "О компании" and breadcrumb "Главная" | `AboutHero.tsx` | hardcoded in component | no admin field | no |
| `/about` | Intro / who we are | `AboutIntro.tsx` | `site.about.copy`, `site.page.about` | `О компании → Тексты на странице`, `Статические страницы → /about` | yes |
| `/about` | B2B cards | `AboutIntro.tsx` | `site.page.about.b2bCards` | `Статические страницы → /about → Карточки B2B` | yes |
| `/about` | Industries grid | `components/sections/about/AboutIndustries.tsx` | hardcoded `INDUSTRIES`, heading and lead | no admin field | no |
| `/about` | Categories / supply directions | `AboutCategories.tsx` | titles/labels from `site.page.about` and `site.about.copy`; category/product values generated from public catalog | `Статические страницы → /about`, `О компании → Тексты на странице`; catalog data via catalog admin | partial |
| `/about` | Why us | `AboutWhyUs.tsx` | `site.page.about.advantages`, `whyChooseTitleTemplate` | `Статические страницы → /about → Преимущества` | yes |
| `/about` | Stats | `AboutStats.tsx` | `site.page.about.statSlots`, some values generated from catalog count | `Статические страницы → /about → Статистика` | partial |
| `/about` | Values / mission / trust | `components/sections/about/AboutValues.tsx` | certifications from `site.page.about`; values, mission, vision, trust texts hardcoded | admin only edits `standardsEyebrow` and certification chips | partial |
| `/about` | Bottom CTA | `AboutCTA.tsx` | `site.about.copy.ctaTitle`, `site.about.copy.ctaSubtitle`, labels from `site.page.about` | `О компании → Тексты на странице`, `Статические страницы → /about` | yes |
| `/contacts` | Metadata / SEO | `app/(site)/contacts/page.tsx` | `site.page.contacts`, with legacy fallback `site.meta.contacts` | `Контакты → Как страница выглядит в поиске`, `Статические страницы → /contacts` | yes |
| `/contacts` | Hero H1 / breadcrumb | `contacts/page.tsx` | `site.page.contacts.h1`, `breadcrumbLabel` | `Статические страницы → /contacts` | yes |
| `/contacts` | Hero lead | `contacts/page.tsx` | hardcoded `CONTACTS_LEAD`; admin has `pageLead` in `site.page.contacts` and legacy `site.contacts.copy` | `Контакты → Тексты рядом с формой`, `Статические страницы → /contacts` | mismatch |
| `/contacts` | Request form title/helper | `contacts/page.tsx`, `QuickRequestForm` | `site.page.contacts.formTitle`, `formHelper`; form labels/validation inside form component | `Контакты → Тексты рядом с формой`, `Статические страницы → /contacts` | partial |
| `/contacts` | Contact cards labels | `contacts/page.tsx` | `site.page.contacts.contactCardLabels` | `Статические страницы → /contacts → Подписи карточек` | yes |
| `/contacts` | Phone/email/address values | `contacts/page.tsx`, `CopyToClipboard` | `lib/company` | no content admin field | no |
| `/contacts` | Work hours lines | `contacts/page.tsx` | `site.page.contacts.workLine1`, `workLine2` | `Статические страницы → /contacts` | yes |
| `/contacts` | WhatsApp card title/subtitle | `contacts/page.tsx` | `site.page.contacts.whatsAppTitle`, `whatsAppSubtitle`; URL from `lib/company` | `Статические страницы → /contacts` | partial |
| `/contacts` | Work directions list | `contacts/page.tsx` | hardcoded `WORK_DIRECTIONS` | no admin field | no |
| `/contacts` | Map block labels/background | `contacts/page.tsx`, `ContactsMapBlock` | `site.page.contacts` map fields + `lib/company` address/map URL | `Статические страницы → /contacts → Блок карты` | partial |
| `/contacts` | Requisites labels/footer note | `contacts/page.tsx` | labels/note from `site.page.contacts`; values from `lib/company.bankDetails` | `Статические страницы → /contacts → Реквизиты` | partial |
| `/contacts` | Final slogan line | `contacts/page.tsx` | hardcoded | no admin field | no |
| `/delivery` | Metadata / SEO | `app/(site)/delivery/page.tsx` | `site.page.delivery` | `Статические страницы → /delivery` | yes |
| `/delivery` | Hero / lead / image | `delivery/page.tsx` | `site.page.delivery.eyebrow`, `h1`, `lead`, `pageImageSrc` | `Статические страницы → /delivery` | yes |
| `/delivery` | Delivery callout | `delivery/page.tsx` | `calloutIntro`, `calloutCityLabel` from CMS; trailing sentence hardcoded | `Статические страницы → /delivery` | partial |
| `/delivery` | Bullets and footer check line | `delivery/page.tsx` | `site.page.delivery.bullets`, `footerCheckLine` | `Статические страницы → /delivery` | yes |
| `/delivery` | CTA labels | `delivery/page.tsx` | labels from `site.page.delivery`; hrefs hardcoded to `/#request-section` and `/contacts` | `Статические страницы → /delivery` | partial |
| `/certificates` | Metadata / SEO | `app/(site)/certificates/page.tsx` | `site.page.certificates` | `Статические страницы → /certificates` | yes |
| `/certificates` | Breadcrumb / H1 / lead | `certificates/page.tsx` | breadcrumb and lead from `site.page.certificates`; hero eyebrow/H1 visible copy mostly hardcoded in component | `Статические страницы → /certificates` | partial |
| `/certificates` | Header image(s) | `certificates/page.tsx` | `site.page.certificates.headerImageSrc` split as image list | `Статические страницы → /certificates → Изображение в шапке` | yes |
| `/certificates` | Feature cards in hero | `certificates/page.tsx` | hardcoded titles/texts | no admin field | no |
| `/certificates` | "По запросу предоставляем" list | `certificates/page.tsx` | hardcoded `PROVIDED_ITEMS` | no admin field | no |
| `/certificates` | Certificate cards | `certificates/page.tsx` | DB certificates via `listPublicActiveCertificates()`; open label from `site.page.certificates` | `Админка → Сертификаты`, `Статические страницы → /certificates → Кнопка открыть документ` | yes |
| `/certificates` | Empty state | `certificates/page.tsx` | `site.page.certificates.emptyTitle`, `emptySubtitle` | `Статические страницы → /certificates` | yes |
| `/certificates` | Quality control section | `certificates/page.tsx` | heading/paragraphs hardcoded; images partly from header image list fallback | no admin field for text | partial |
| `/certificates` | Industries / reliability sections | `certificates/page.tsx` | hardcoded `INDUSTRIES`, headings and paragraphs | no admin field | no |
| footer | Pre CTA | `components/layout/Footer.tsx` | `site.footer.preCta`; email URL from `lib/company` | `Подвал сайта → Призыв перед основным подвалом` | partial |
| footer | Trust bar | `Footer.tsx` | `site.footer.trustBar`; icons fixed by order in code | `Подвал сайта → Полоска с преимуществами` | partial |
| footer | Logo/tagline/legal/address/hours/links | `Footer.tsx` | `site.footer.main` + `lib/company` for BIN/IIK/phone/email | `Подвал сайта → Колонки ссылок и контакты` | partial |
| footer | Contact phone/email values | `Footer.tsx` | `lib/company` | no content admin field | no |
| header CTA | Top nav links | `app/(site)/layout.tsx`, `Header.tsx`, `TopBar.tsx` | `site.header.topNav` | `Шапка сайта → Верхнее меню` | yes |
| header CTA | Logo/brand | `MainHeader.tsx`, `TopBar.tsx` | `HEADER_LOGO_SRC` + `lib/company.name` | no content admin field for header logo/name | no |
| header CTA | Search placeholder/button | `MainHeader.tsx`, `CatalogSearchPanel` | component defaults/hardcoded | no content admin field | no |
| header CTA | Sales phone/email card | `MainHeader.tsx` | labels hardcoded, values from `lib/company` | no content admin field | no |
| header CTA | Delivery card | `MainHeader.tsx` | text and href hardcoded (`/delivery`) | no content admin field | no |
| header CTA | Mobile menu contacts/socials | `Header.tsx` | labels hardcoded, values/URLs from `lib/company` | no content admin field | no |
| header CTA | Category bar | `app/(site)/layout.tsx`, `HeaderCategoryBar.tsx` | public catalog categories from DB/JSON | category admin controls names/slugs/order, not content admin | partial |
| floating CTA | WhatsApp floating button | `FloatingWhatsApp.tsx` | `COMPANY_WHATSAPP_BASE_URL` | no content admin field | no |

## Нужно добавить в CMS

1. `/certificates`: hero eyebrow/H1 visible copy, hero intro paragraphs, three feature cards, "По запросу предоставляем" list, "Контроль качества" heading/paragraphs, industries/reliability headings and paragraphs.
2. `/about`: `AboutIndustries` section heading, lead and industry cards.
3. `/about`: `AboutValues` core values, mission/vision, trust list and final slogan.
4. `/contacts`: work directions list and final slogan line.
5. Header CTA: sales card labels, delivery card text, search placeholder/button text, mobile menu helper labels.
6. Header/footer/company contacts: phone, email, address, BIN/IIK and social URLs are managed through `lib/company`, not content admin. If менеджер должен менять их без разработчика, нужен отдельный settings/company CMS section.
7. `/delivery`: callout trailing sentence and CTA hrefs if they should be managed by content team.
8. `/about`: hero eyebrow and breadcrumb link label "Главная" are hardcoded in component.

## Критичные несостыковки

1. **Главная SEO:** `app/(site)/page.tsx` вызывает `resolveHomeMeta()`, но не использует результат. Админка редактирует `site.meta.home`, а публичная metadata остается из констант `HOME_SEO_TITLE` / `HOME_SEO_DESCRIPTION`.
2. **Контакты lead:** в админке есть `pageLead` для `site.page.contacts` и legacy `site.contacts.copy`, но публичная страница показывает hardcoded `CONTACTS_LEAD`.
3. **Сертификаты:** страница выглядит как CMS-управляемая, но большая часть видимого текста находится прямо в `app/(site)/certificates/page.tsx`.
4. **О компании:** часть страницы уже управляется через `site.page.about`, но блоки `AboutIndustries` и большая часть `AboutValues` остаются в коде. Это создает ощущение, что админка редактирует не всю видимую страницу.
5. **Header CTA / contacts:** самые заметные контактные значения и CTA в шапке берутся из `lib/company`, а не из админки. Это нормально как конфигурация, но не как CMS для менеджера.

## Примечания

- Публичный layout получает верхнее меню из `site.header.topNav`, а ссылки категорий в синей полосе строит из публичного каталога. Это не `content_blocks`, но управляется через админку категорий.
- Footer частично CMS-управляемый: тексты, ссылки, логотип и подписи редактируются, но юридические/контактные значения частично остаются в `lib/company`.
- На этом этапе код не менялся: документ фиксирует карту и места для будущего добавления CMS-полей.
