# Архитектура проекта MANSVALVE GROUP

Обновлено: 2026-06-05  
Статус: актуальная карта проекта по текущему коду.  
Аудитория: внешний архитектор, техлид, разработчик, SEO/Ads подрядчик, владелец проекта.

**Краткое руководство для внешнего архитектора (admin ↔ site, сценарии, CMS, каталог):** [`docs/external-architect-guide.md`](docs/external-architect-guide.md)

## 1. Назначение системы

`MANSVALVE GROUP` — B2B-сайт поставщика промышленной трубопроводной арматуры в Казахстане.

Проект объединяет:

- публичный сайт с маркетинговыми страницами, каталогом, SEO-страницами и формами заявок;
- каталог промышленной арматуры с категориями, подкатегориями, фильтрами, поиском, карточками товара и каноническими URL;
- админ-панель для управления товарами, категориями, подкатегориями, сертификатами, медиа, заявками и контентом публичных страниц;
- CMS-слой `content_blocks` для редактируемых текстов и изображений страниц;
- Postgres + Drizzle как основной источник данных в production;
- JSON-каталог как fallback/recovery источник, который нельзя использовать как скрытую production-подмену DB;
- SEO-инфраструктуру: metadata, canonical, JSON-LD, sitemap, robots, редиректы, 404;
- аналитику Google Tag Manager / Google Ads / Google tag и события конверсий;
- систему загрузки медиа и документов.

Главный архитектурный принцип: публичный сайт, SEO-страницы, поиск, sitemap, JSON-LD и admin preview должны смотреть на один и тот же нормализованный слой данных, а не собирать свои версии товара из сырых полей.

## 2. Технологический стек

| Область | Технологии |
|---|---|
| Framework | Next.js 16 App Router |
| UI | React 19, TypeScript, Tailwind CSS v4 |
| UI primitives | Radix UI / shadcn-style компоненты, lucide-react |
| Animation | framer-motion |
| DB | Postgres |
| ORM | Drizzle ORM, `postgres` driver |
| Validation | zod |
| Auth | JWT session в httpOnly cookie, `jose`, `bcryptjs` |
| Storage | local filesystem или Supabase Storage |
| Analytics | GTM, Google tag / Google Ads conversions |
| Import | ExcelJS для импорта товаров |
| Icons/images | sharp, to-ico, scripts for favicon/app icons |

Основные команды:

```bash
npm run dev
npm run build
npm run lint
npm run db:generate
npm run db:migrate
npm run db:seed
npm run db:import-catalog
npm run catalog:parity-check
npm run catalog:slug-check
npm run seo:audit
npm run generate:icons
```

## 3. Высокоуровневая схема

```text
Browser
  -> Next.js App Router route
    -> Server Component / generateMetadata
      -> public catalog adapter / site-content resolver / service
        -> Postgres via Drizzle, or JSON recovery catalog
      -> buildPublicProductView() for product-facing output
      -> UI components
    -> Client components only for interaction:
       filters, search box, forms, tracking, uploads, collapsible UI
    -> API routes / server actions
      -> zod validation
      -> service layer
      -> DB / storage / revalidation / analytics response
```

Разделение слоев:

```text
app/          routes, layouts, metadata routes, API routes, server actions
components/   UI, public sections, catalog widgets, admin UI
lib/          business logic, adapters, services, SEO, analytics, auth, DB
data/         JSON fallback catalog snapshot
public/       static assets, uploads, favicon/app icons
scripts/      imports, migrations helpers, SEO checks, icon generation
docs/         audits, content maps, product content contracts, roadmap notes
```

## 4. Ключевые архитектурные правила

1. Публичный каталог читается только через `lib/public-catalog/*`.
2. Публичное представление товара строится только через `buildPublicProductView()` или легкую карточную версию `buildPublicProductCardView()`.
3. Client Components не импортируют server-only services.
4. Админские мутации идут через server actions или admin API routes с обязательной серверной проверкой.
5. Все формы и API payload валидируются zod-схемами.
6. Публичные страницы должны иметь fallback defaults и не падать без БД, где это предусмотрено.
7. Если `PUBLIC_CATALOG_SOURCE=db`, production не должен тихо уходить в JSON, кроме явного recovery mode.
8. Generated content не должен незаметно сохраняться как ручной текст в админке.
9. Canonical URL товара не меняется при правке названия.
10. Telegram удален из пользовательской и админской логики; заявки сохраняются в БД и видны в `/admin/leads`.

## 5. Физическая структура проекта

```text
mansvalve/
├── app/
│   ├── layout.tsx
│   ├── not-found.tsx
│   ├── robots.ts
│   ├── sitemap.ts
│   ├── globals.css
│   ├── (site)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── about/page.tsx
│   │   ├── contacts/page.tsx
│   │   ├── certificates/page.tsx
│   │   ├── delivery/page.tsx
│   │   ├── privacy/page.tsx
│   │   ├── terms/page.tsx
│   │   ├── thank-you-page/page.tsx
│   │   ├── catalog/
│   │   │   ├── (listing)/page.tsx
│   │   │   ├── (dynamic)/[slug]/page.tsx
│   │   │   ├── (dynamic)/[slug]/[subcategorySlug]/page.tsx
│   │   │   ├── (dynamic)/[slug]/[subcategorySlug]/[productSlug]/page.tsx
│   │   │   ├── category/[categorySlug]/page.tsx
│   │   │   └── subcategory/[subcategorySlug]/page.tsx
│   │   ├── tovar/[slug]/page.tsx
│   │   ├── [categorySlug]/[landingSlug]/page.tsx
│   │   ├── flancy/[landingSlug]/page.tsx
│   │   └── klapany/obratnye/[landingSlug]/page.tsx
│   ├── admin/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── login/
│   │   ├── catalog-health/
│   │   ├── products/
│   │   ├── categories/
│   │   ├── certificates/
│   │   ├── content/
│   │   ├── leads/
│   │   ├── media/
│   │   └── settings/
│   └── api/
│       ├── request/route.ts
│       ├── search/products/route.ts
│       └── admin/media/**
├── components/
│   ├── admin/
│   ├── analytics/
│   ├── catalog/
│   ├── contacts/
│   ├── layout/
│   ├── motion/
│   ├── search/
│   ├── sections/
│   ├── seo/
│   └── ui/
├── lib/
│   ├── admin/
│   ├── auth/
│   ├── catalog/
│   ├── catalog-query/
│   ├── db/
│   ├── leads/
│   ├── products-import/
│   ├── public-catalog/
│   ├── search/
│   ├── seo/
│   ├── seo-product-pages/
│   ├── services/
│   ├── site-content/
│   ├── storage/
│   └── *.ts
├── data/
│   ├── catalog-products.json
│   └── catalog-overrides.json
├── docs/
│   ├── admin-public-content-map.md
│   ├── admin-public-data-map.md
│   ├── product-content-contract.md
│   ├── site-bug-audit.md
│   └── ...
├── public/
│   ├── favicon.ico
│   ├── favicon.svg
│   ├── favicon-16.png
│   ├── favicon-32.png
│   ├── favicon-48.png
│   ├── icon.png
│   ├── apple-icon.png
│   ├── images/
│   └── uploads/
├── scripts/
├── proxy.ts
├── next.config.ts
├── drizzle.config.ts
└── package.json
```

## 6. Runtime layouts

### Root layout

Файл: `app/layout.tsx`

Отвечает за:

- глобальные metadata;
- favicon/app icons;
- `metadataBase` через `getSiteBaseUrl()`;
- базовые JSON-LD `Organization` и `WebSite`;
- подключение Google Tag Manager или Google tag через `next/script`;
- глобальные клиентские трекеры;
- toaster.

Важная настройка аналитики: page view не должен дублироваться. Google tag конфигурируется так, чтобы кастомный `PageViewTracker` контролировал отправку page views в App Router.

### Public layout

Файл: `app/(site)/layout.tsx`

Отвечает за:

- публичный header;
- публичный footer;
- floating WhatsApp;
- motion provider;
- отсутствие admin chrome.

### Admin layout

Файл: `app/admin/layout.tsx`

Отвечает за:

- admin sidebar/header;
- server-side guard авторизации;
- изоляцию админки от публичной аналитики и публичного layout.

## 7. Публичные маршруты

| Route | Назначение |
|---|---|
| `/` | Главная B2B-страница |
| `/about` | О компании |
| `/contacts` | Контакты |
| `/delivery` | Доставка |
| `/certificates` | Сертификаты |
| `/privacy` | Политика конфиденциальности |
| `/terms` | Условия |
| `/thank-you-page` | Страница благодарности после успешной заявки |
| `/catalog` | Общий листинг каталога |
| `/catalog/category/[categorySlug]` | Каноническая страница категории |
| `/catalog/subcategory/[subcategorySlug]` | Страница подкатегории |
| `/catalog/[slug]` | Dynamic dispatcher: category page или legacy товарный slug |
| `/catalog/[slug]/[subcategorySlug]` | Вложенная страница подкатегории |
| `/catalog/[slug]/[subcategorySlug]/[productSlug]` | Legacy/nested product route с canonical redirect при необходимости |
| `/tovar/[slug]` | Основной канонический шаблон товара |
| `/[categorySlug]/[landingSlug]` | SEO landing pages по категориям и сериям |
| `/flancy/[landingSlug]` | Отдельные SEO landing pages для фланцев |
| `/klapany/obratnye/[landingSlug]` | SEO landing pages для обратных клапанов |
| `/robots.txt` | Metadata route `app/robots.ts` |
| `/sitemap.xml` | Metadata route `app/sitemap.ts` |

Файл `app/not-found.tsx` содержит адаптированную 404-страницу с навигацией обратно в основные разделы. Это важно для SEO и UX, потому что прежний стандартный 404 не удерживал пользователя.

## 8. Admin routes

| Route | Назначение |
|---|---|
| `/admin/login` | Авторизация |
| `/admin` | Обзор |
| `/admin/catalog-health` | Диагностика каталога |
| `/admin/products` | Список товаров |
| `/admin/products/new` | Новый товар |
| `/admin/products/[id]` | Редактирование товара |
| `/admin/products/import` | Импорт товаров |
| `/admin/products/series` | Управление SEO-сериями |
| `/admin/categories` | Категории |
| `/admin/categories/[id]/edit` | Редактирование категории |
| `/admin/categories/[id]/subcategories/new` | Новая подкатегория |
| `/admin/categories/[id]/subcategories/[subId]/edit` | Редактирование подкатегории |
| `/admin/certificates` | Сертификаты |
| `/admin/certificates/new` | Новый сертификат |
| `/admin/certificates/[id]` | Редактирование сертификата |
| `/admin/content` | CMS-контент страниц |
| `/admin/leads` | Заявки |
| `/admin/leads/[id]` | Детали заявки |
| `/admin/media` | Медиа-библиотека |
| `/admin/settings` | Настройки |

Server actions находятся рядом с разделами:

```text
app/admin/products/actions.ts
app/admin/categories/actions.ts
app/admin/certificates/actions.ts
app/admin/content/actions.ts
app/admin/leads/actions.ts
app/admin/login/actions.ts
```

## 9. Авторизация админки

Ключевые файлы:

- `proxy.ts` — edge guard для `/admin/*`;
- `lib/auth/session.ts` — JWT session в httpOnly cookie;
- `lib/auth/current-user.ts` — получение текущего админа;
- `lib/auth/config.ts` — cookie/session config;
- `lib/auth/password.ts` — bcrypt hash/verify.

Принцип:

- страница `/admin/login` доступна без сессии;
- все остальные `/admin/*` требуют валидную сессию;
- server actions дополнительно проверяют admin на сервере;
- клиентские проверки не считаются защитой.

## 10. Database schema

Схема: `lib/db/schema.ts`  
DB client: `lib/db/client.ts`, `lib/db/drizzle-core.ts`  
Миграции: `lib/db/migrations/*`

Основные таблицы:

| Table | Назначение |
|---|---|
| `admin_users` | Администраторы |
| `categories` | Категории каталога |
| `subcategories` | Подкатегории |
| `media_assets` | Медиа-файлы и документы |
| `products` | Товары |
| `product_specs` | Ручные характеристики товара |
| `product_images` | Галерея и primary image товара |
| `product_slug_aliases` | Старые slug товара для 308 redirect |
| `certificates` | Сертификаты с preview image и PDF/document |
| `leads` | Заявки с сайта |
| `content_blocks` | CMS JSON-блоки публичных страниц |
| `company_settings` | Singleton настройки компании |

### Products

Важные поля:

- `slug` — стабильный URL slug;
- `name` — внутреннее название для админки;
- `publicTitle` / DB `public_title` — публичное название на сайте, optional override;
- `h1Override` / DB `h1_override` — optional H1 override;
- `categoryId`, `subcategoryId`;
- denormalized `categoryName`, `subcategoryName`;
- `dn`, `pn`, `thread`, `material`, `connectionType`, `controlType`, `model`;
- `shortDescription`, `longDescription`;
- `detailBlocks` / DB `detail_blocks` — ручные блоки карточки товара;
- `specificationMediaId`, `questionnaireMediaId`, `documentationMediaId`;
- `isActive`, `isFeatured`, `sortOrder`;
- `externalId` для связи с legacy JSON import.

### Categories / subcategories

Категории и подкатегории имеют:

- `slug`;
- `name`;
- `description`;
- `seoMetaDescription`;
- `sortOrder`;
- `isActive`;
- `externalId`.

Категории дополнительно имеют:

- `seoContent`;
- `heroImageUrl`.

Публичная сортировка:

```text
categories: sort_order ASC, name ASC
subcategories: sort_order ASC, name ASC
```

### Leads

Таблица `leads` хранит:

- `name`;
- `phone`;
- `email`;
- `comment`;
- `source`;
- `page`;
- product context: `productName`, `productSlug`, `productCategory`, `productSubcategory`, `productId`;
- `attribution` JSONB;
- `ip`, `userAgent`;
- `status`: `new`, `in_progress`, `done`, `spam`;
- `assignedTo`, `handledAt`, `internalNote`;
- `createdAt`, `updatedAt`.

Legacy значения `won/lost` допускаются как старые значения БД, но новый UI работает с `new/in_progress/done/spam`.

Telegram из модели и UI удален. Не должно быть `telegramUrl`, `telegram_username`, `source=telegram`, Telegram-фильтров или колонок.

## 11. Public catalog source

Единая точка чтения публичного каталога: `lib/public-catalog/index.ts`.

Экспортируемые функции:

```ts
getPublicCatalogCategories()
getPublicCatalogProducts()
getPublicCatalogListingProducts()
getPublicProductBySlug()
getPublicCategoryBySlug()
getPublicCategoryById()
getPublicSubcategoryBySlug()
getPublicProductsByCategory()
getPublicProductsBySubcategory()
countPublicProductsByCategory()
countPublicProductsBySubcategory()
```

Источники:

- DB adapter: `lib/public-catalog/db-adapter.ts`;
- JSON adapter: `lib/public-catalog/json-adapter.ts`;
- public types: `lib/public-catalog/types.ts`;
- list DTO: `lib/public-catalog/catalog-list-product.ts`.

Выбор источника:

```text
PUBLIC_CATALOG_SOURCE=db      -> Postgres via Drizzle
PUBLIC_CATALOG_SOURCE=json    -> JSON only in dev/recovery mode
PUBLIC_CATALOG_FROM_DB=true   -> legacy switch to DB
unset                         -> DB if DATABASE_URL exists, else JSON
```

Production safety:

- если в production настроен `DATABASE_URL`, а `PUBLIC_CATALOG_SOURCE=json`, JSON игнорируется без явного recovery mode;
- если `PUBLIC_CATALOG_SOURCE=db` и DB adapter падает, silent JSON fallback не применяется в production;
- JSON fallback допустим только в dev или при явных `PUBLIC_CATALOG_ALLOW_JSON_FALLBACK=true` / `PUBLIC_CATALOG_RECOVERY_MODE=json`.

Это критичный source-of-truth контракт: админка пишет в БД, поэтому production должен читать DB, иначе менеджер будет видеть сохранение, которое не отражается на сайте.

## 12. Public product view contract

Главный файл: `lib/public-catalog/product-view.ts`

Ключевые функции:

```ts
buildPublicProductView(product)
buildPublicProductCardView(product)
```

`buildPublicProductView()` является единой точкой для:

- публичного названия;
- H1;
- SEO title;
- SEO description;
- short/full description;
- content sections;
- primary image;
- canonical URL;
- JSON-LD product data;
- admin public preview.

Выходной тип `PublicProductView` содержит:

```ts
internalTitle
generatedDisplayName
displayName
h1
seoTitle
seoDescription
shortDescription
fullDescription
contentSections
detailContent
categoryLabel
catalogPath
canonicalPath
canonicalUrl
primaryImageUrl
primaryImageAlt
primaryImageUnoptimized
imageCount
```

Правило публичного имени:

```text
displayName =
  product.publicTitle
  OR seriesPage.title
  OR generatedDisplayName

h1 =
  product.h1Override
  OR seriesPage.h1
  OR product.publicTitle
  OR generatedDisplayName
```

Generated naming:

Файл: `lib/catalog/product-naming.ts`

Формула:

```text
[тип товара] + [материал] + [конструкция/тип] + [соединение/особенность] + [модель] + [DN] + [PN]
```

Примеры:

- `Задвижка стальная клиновая фланцевая 30с41нж DN100 PN16`
- `Задвижка стальная клиновая под приварку 30с41нж DN100 PN16`
- `Задвижка чугунная фланцевая 30ч6бр DN100 PN16`
- `Задвижка чугунная с обрезиненным клином 30ч39р DN100 PN16`

Admin UX contract:

- `name` в форме товара — внутреннее название;
- `publicTitle` — публичное название на сайте;
- если `publicTitle` пустой, используется generated name;
- generated preview показывается, но не сохраняется в ручное поле без явного действия.

## 13. Product detail content

Ключевые файлы:

- `lib/product-detail-content.ts`;
- `lib/product-detail-blocks.ts`;
- `docs/product-content-contract.md`.

Карточка товара должна поддерживать:

- краткое описание;
- полное описание;
- характеристики;
- стандарты;
- преимущества;
- область применения;
- документация и контроль качества;
- условия поставки.

Источник данных:

1. ручные поля товара из DB;
2. `detail_blocks`;
3. ручные `product_specs`;
4. generated fallback по категории/модели/DN/PN;
5. fallback из категории, если товар не имеет своего текста.

Для характеристик действует merge:

```text
generated core specs
  + admin product_specs
  -> без дублей
  -> admin value имеет приоритет для совпадающего ключа
```

Это защищает карточку от двух ошибок:

- ручные specs пустые, и DN/PN/model/material пропадают;
- DN/PN/model/material дублируются в generated и manual блоках.

## 14. Canonical strategy и product URLs

Основные файлы:

- `lib/product-detail-content.ts`;
- `lib/catalog-routes.ts`;
- `lib/catalog-legacy-product-redirect.ts`;
- `lib/public-catalog/slug-aliases.ts`;
- `app/(site)/tovar/[slug]/page.tsx`;
- `app/(site)/catalog/(dynamic)/**`.

Preferred canonical:

- типовые товары: `/tovar/[slug]`;
- товары, привязанные к SEO-серии: canonical path серии;
- некоторые клапаны/вложенные структуры: nested catalog path, если это задано route logic.

Правила:

- slug не меняется автоматически при правке публичного названия;
- старые slug должны давать 308 на новый canonical через `product_slug_aliases`;
- `/catalog/[slug]` для товарного slug является legacy dispatcher и редиректит на canonical;
- sitemap должен включать canonical URL, а не все дублирующие legacy paths;
- metadata, JSON-LD и OpenGraph используют тот же canonical.

## 15. Catalog listing, filters, search

Основные файлы:

- `components/catalog/CatalogShell.tsx`;
- `components/catalog/CatalogFilters.tsx`;
- `components/catalog/ProductGrid.tsx`;
- `components/catalog/ProductCard.tsx`;
- `components/catalog/Pagination.tsx`;
- `lib/catalog-query/engine.ts`;
- `lib/catalog-query/normalize.ts`;
- `lib/search/*`.

URL state:

```text
q
category
subcategory
model
dn
pn
thread
material
connectionType
controlType
page
```

Поиск понимает:

- кириллицу/латиницу для моделей: `30ч6бр` / `30ch6br`;
- варианты DN/ДУ: `dn100`, `dn 100`, `ду100`;
- варианты PN/РУ: `pn16`, `pn 16`, `ру16`;
- разделители и пробелы в моделях;
- базовую морфологию категорий: `задвижка`, `задвижки`, `задвижек`;
- тип соединения: `фланцевое`, `под приварку`, `welding`;
- материал: чугун, сталь, нержавеющая сталь, WCB.

Header search:

- UI: `components/search/CatalogSearchPanel.tsx`;
- API: `app/api/search/products/route.ts`;
- lightweight DTO: `lib/search/product-search-dto.ts`;
- DB mode search: `lib/search/product-search-db.ts`.

## 16. Categories and subcategories

Services:

- `lib/services/categories.ts`;
- `lib/services/category-public-content.ts`;
- `lib/category-content.ts`;
- `lib/catalog-routes.ts`.

Admin:

- `/admin/categories`;
- `/admin/categories/[id]/edit`;
- `/admin/categories/[id]/subcategories/new`;
- `/admin/categories/[id]/subcategories/[subId]/edit`.

Публичный слой:

- категории и подкатегории сортируются по `sort_order ASC, name ASC`;
- изменение порядка в админке влияет на public catalog при DB source;
- удаление категории запрещено, если есть товары или подкатегории;
- удаление подкатегории запрещено, если есть товары.

Source of truth:

- visible description, metadata description и JSON-LD description подкатегории должны брать один resolved description;
- manual DB description/SEO fields имеют приоритет;
- generated fallback используется только если ручной текст отсутствует.

## 17. SEO landing pages and series

Основные файлы:

- `lib/catalog-seo.ts`;
- `lib/seo-product-pages/gate-valves.ts`;
- `lib/seo-product-pages/industrial-series.ts`;
- `lib/seo-product-pages/product-series.ts`;
- `app/(site)/[categorySlug]/[landingSlug]/page.tsx`;
- `app/(site)/flancy/[landingSlug]/page.tsx`;
- `app/(site)/klapany/obratnye/[landingSlug]/page.tsx`.

Типы SEO-страниц:

1. Category/model landing pages: например `/zadvizhki/30ch6br`.
2. Product series pages: серия может агрегировать товары и влиять на canonical.
3. SKU-like SEO pages: должны использовать активный product или fallback только если страница намеренно поддерживается.

Правило JSON-LD для SEO product pages:

- если найден реальный product из DB/JSON, JSON-LD берет name/description/image/url/specs/offers из `buildPublicProductView()`;
- static SEO template используется только как fallback, если product не найден;
- визуальный H1 и JSON-LD name не должны расходиться.

## 18. SEO infrastructure

### Metadata

Файлы:

- `app/layout.tsx`;
- `lib/seo/metadata.ts`;
- page-level `generateMetadata`.

Правила:

- no meta keywords;
- title и description нормализуются по длине и brand suffix;
- canonical должен быть self-canonical для индексируемых страниц;
- filter/query duplicates не должны попадать как отдельные canonical pages;
- пагинация каталога должна иметь корректный canonical и быть доступной для индексации, если страница нужна для товаров.

### Sitemap

Файл: `app/sitemap.ts`  
URL: `/sitemap.xml`

Включает:

- статические public pages;
- категории;
- подкатегории;
- canonical product URLs;
- поддерживаемые SEO landing pages;
- дедупликацию.

Не должен включать:

- admin/API;
- legacy duplicate product URLs;
- SKU SEO pages без активного товара, если они не являются intentionally supported landing pages;
- query/filter garbage URLs.

### Robots

Файл: `app/robots.ts`  
URL: `/robots.txt`

Должен:

- разрешать публичный сайт и каталог;
- закрывать `/admin/` и `/api/`;
- не блокировать важные product/category pages;
- ссылаться на sitemap;
- не запрещать изображения и favicon assets для Googlebot-Image.

### Redirects and canonical mirror

Ключевые места:

- `next.config.ts`;
- `proxy.ts`;
- route-level permanent redirects.

Нужно поддерживать:

- non-www как основное зеркало;
- редиректы www -> non-www или наоборот по выбранному зеркалу;
- lowercase/canonical URL для известных маршрутов;
- 301/308 для старых slug и legacy product paths.

## 19. CMS / content_blocks

Ключевые файлы:

- `lib/site-content/keys.ts`;
- `lib/site-content/models.ts`;
- `lib/site-content/public.ts`;
- `lib/services/content-blocks.ts`;
- `app/admin/content/page.tsx`;
- `docs/admin-public-content-map.md`.

Ключи:

```ts
site.home.hero
site.home.productShowcases
site.home.trustStrip
site.home.requestCta
site.home.faq
site.meta.home
site.home.categories
site.home.whyUs
site.home.howItWorks
site.home.whoWeSupply
site.home.deliveryCase
site.header.topNav
site.footer.preCta
site.footer.trustBar
site.footer.main
site.meta.about
site.meta.contacts
site.about.copy
site.contacts.copy
site.page.about
site.page.contacts
site.page.delivery
site.page.certificates
site.page.privacy
site.page.terms
```

Поток:

```text
content_blocks.data JSONB
  -> zod parse
  -> merge with defaults
  -> public resolver
  -> page component / metadata
```

Безопасность:

- если `DATABASE_URL` отсутствует, public pages используют defaults;
- invalid JSON не должен ломать страницу;
- partial JSON merge должен сохранять default поля;
- admin form должен редактировать тот же key, который читает public page.

About page contract:

- `/about` читает один consolidated resolver;
- hero text и hero image должны быть editable через admin content;
- placeholder "Изображение компании" используется только если image не выбран.

## 20. Public page content ownership

Карта ответственности:

| Page/Area | Основной источник |
|---|---|
| Home | `site.home.*` content blocks + catalog/product showcase data |
| About | `site.page.about` / consolidated about resolver |
| Contacts | `site.page.contacts` + company config/settings |
| Delivery | `site.page.delivery` |
| Certificates | certificates service + `site.page.certificates` |
| Header top nav | `site.header.topNav` where managed, otherwise route config |
| Footer | `site.footer.*` + company config + catalog categories |
| Product cards/pages | `buildPublicProductView()` / card view |
| Category pages | category DB fields + category content resolver |
| Subcategory pages | subcategory DB fields + resolved description |

Detailed audit is in `docs/admin-public-content-map.md`.

## 21. Media and storage

Ключевые файлы:

- `lib/services/media.ts`;
- `lib/storage/index.ts`;
- `lib/storage/local-driver.ts`;
- `lib/storage/supabase-driver.ts`;
- `lib/media-url.ts`;
- `lib/media-image.ts`;
- `lib/media-image-trusted-hosts.ts`;
- `app/api/admin/media/route.ts`;
- `app/api/admin/media/[id]/route.ts`.

Таблица: `media_assets`

Поля:

- `storageKey`;
- `url`;
- `mimeType`;
- `sizeBytes`;
- `width`;
- `height`;
- `alt`;
- `driver`;
- `createdBy`;
- `createdAt`.

Использование:

- product images через `product_images`;
- product documents через `specificationMediaId`, `questionnaireMediaId`, `documentationMediaId`;
- certificates preview image через `mediaAssetId`;
- certificates PDF/document через `documentMediaId`;
- CMS image fields могут хранить URL или media reference в зависимости от формы.

Production note:

- local uploads лежат в `public/uploads`;
- при standalone deploy Nginx должен отдавать `/uploads/*` как static alias или файлы должны быть доступны в `.next/standalone/public/uploads`;
- иначе Next может отдавать 404 для реально существующего файла.

Compatibility note:

- `certificates.document_media_id` имеет compatibility guard, потому что на старых БД колонка могла отсутствовать;
- media service не должен падать, если optional column еще не применена миграцией.

## 22. Certificates

Ключевые файлы:

- `app/(site)/certificates/page.tsx`;
- `app/admin/certificates/*`;
- `components/admin/CertificateForm.tsx`;
- `lib/services/certificates.ts`;
- `lib/services/certificate-schema.ts`.

Сертификат содержит:

- title;
- description;
- preview image;
- optional PDF/document;
- issuedAt;
- sortOrder;
- isActive.

Публичная страница показывает активные сертификаты, сортирует по `sortOrder`, дате и id, и дает ссылку на документ, если PDF прикреплен.

## 23. Leads / заявки

Ключевые файлы:

- public form: `components/contacts/QuickRequestForm.tsx`;
- API: `app/api/request/route.ts`;
- service: `lib/services/leads.ts`;
- status labels: `lib/leads/lead-status-public.ts`;
- contact links: `lib/leads/lead-contact-links.ts`;
- admin list/detail: `app/admin/leads/*`;
- date formatting: `lib/admin/date-format.ts`.

Поток:

```text
User submits form
  -> POST /api/request
    -> zod validation
    -> honeypot/rate checks
    -> create lead in Postgres
    -> return success
    -> client redirects to /thank-you-page
  -> /admin/leads shows the lead
```

Обязательные поля:

- имя / организация;
- телефон.

Сохраняемые поля:

- name;
- phone;
- email, если есть;
- comment;
- source;
- page;
- product context;
- attribution;
- IP;
- User-Agent;
- status `new`;
- createdAt/updatedAt.

Admin UX:

- даты показываются в `Asia/Almaty`;
- формат `DD.MM.YYYY, HH:mm`;
- пустые значения отображаются как `—`;
- UTM показываются только если реально есть;
- referrer фильтруется от мусорных источников вроде localhost, внутреннего домена, chatgpt.com;
- raw technical JSON спрятан в collapsible и очищен от null-полей.

## 24. Forms and conversions

Публичные формы:

- quick request / КП;
- contacts-related CTA;
- product inquiry via WhatsApp links.

После успешной отправки заявки пользователь должен попасть на:

```text
/thank-you-page
```

Это нужно для Google Ads/GTM конверсий и понятной UX-обратной связи.

События:

- phone click;
- WhatsApp click;
- email click, если включен;
- successful form submit;
- page view thank-you page.

Важно: событие успешной заявки фиксируется только после ответа сервера, а не по клику на кнопку submit.

## 25. Analytics and Google Ads

Ключевые файлы:

- `lib/analytics-config.ts`;
- `lib/analytics.ts`;
- `components/analytics/PageViewTracker.tsx`;
- `components/analytics/GlobalClickTracker.tsx`;
- `app/layout.tsx`.

Current defaults:

```ts
GTM_ID = "GTM-KHXXZS38"
GOOGLE_TAG_ID = "AW-18163182394"
GOOGLE_ADS_DEFAULT_SEND_TO = "AW-18163182394/BBtnCPz4nLMcELrW8NRD"
```

Override env:

```text
NEXT_PUBLIC_GTM_ID
NEXT_PUBLIC_GOOGLE_TAG_ID
NEXT_PUBLIC_GOOGLE_ADS_PHONE_CONVERSION_SEND_TO
NEXT_PUBLIC_GOOGLE_ADS_WHATSAPP_CONVERSION_SEND_TO
NEXT_PUBLIC_GOOGLE_ADS_EMAIL_CONVERSION_SEND_TO
NEXT_PUBLIC_GOOGLE_ADS_FORM_CONVERSION_SEND_TO
```

Правила:

- GTM является основным транспортом, если `GTM_ID` задан;
- direct Google tag используется как fallback, если GTM не задан;
- скрипты подключаются через `next/script`, чтобы не блокировать сайт;
- `/admin` исключен из page tracking, click tracking и conversion tracking;
- `gclid`, `utm_*` и другие query параметры не должны срезаться редиректами.

## 26. Company config

Файл: `lib/company.ts`

Назначение:

- brand name;
- phone/email/address;
- WhatsApp link builders;
- product inquiry text builders;
- company legal details;
- публичные CTA constants.

Правило: UI не должен дублировать raw phone/WhatsApp links, если можно использовать helper из `lib/company.ts`.

## 27. Header and footer

Header:

- public layout components in `components/layout/*`;
- search panel;
- phone/WhatsApp/Instagram/contact CTA;
- category navigation.

Footer:

- catalog links;
- company links;
- contacts;
- legal links;
- company text.

SEO/UX caveat:

- footer links должны вести на существующие public routes;
- старые `/catalog/subcategory/...` links должны корректно резолвиться или редиректиться;
- ссылки, которые дают 500/404, нужно считать high priority SEO defect.

## 28. Motion and visual behavior

Ключевые файлы:

- `lib/motion.ts`;
- `components/motion/PublicMotionProvider.tsx`;
- `components/motion/ScrollReveal.tsx`;
- `components/motion/CssReveal.tsx`;
- `components/sections/*Client.tsx`;
- `components/sections/ProductShowcaseCarousel.tsx`.

Правила:

- Server Components отвечают за данные;
- Client Components — только там, где нужна интерактивность/анимация;
- respect reduced motion;
- не использовать анимацию как источник layout shift;
- fixed-format UI элементы должны иметь стабильные размеры.

## 29. Admin product management UX

Главный компонент: `components/admin/ProductForm.tsx`

Цель формы товара:

- менеджер должен понимать, что является внутренним полем, что публичным override, а что generated preview;
- preview должен совпадать с публичным сайтом;
- image preview должен использовать тот же resolver, что ProductCard и product page.

Структура формы:

- Основное;
- Изображения;
- Контент страницы товара;
- Характеристики;
- Документы;
- SEO preview;
- Публичный preview;
- Sticky save actions.

Контракт:

- поле `Внутреннее название` влияет на админку и raw DB `products.name`;
- поле `Публичное название на сайте` влияет на public `displayName`;
- если публичное название пустое, `buildPublicProductView()` генерирует название;
- SEO-блок показывает generated SEO preview, не дублирует редактирование описаний;
- описание/стандарты/преимущества/область применения/документы/условия поставки являются управляемым контентом товара, если заполнены.

## 30. Product imports

Ключевые файлы:

- `lib/products-import/parser.ts`;
- `lib/products-import/preview.ts`;
- `lib/products-import/apply.ts`;
- `lib/products-import/columns.ts`;
- `lib/products-import/slug-builder.ts`;
- `lib/products-import/template.ts`;
- `app/admin/products/import/*`;
- scripts in `scripts/db/*`.

Назначение:

- импорт Excel прайсов;
- preview изменений;
- безопасное применение;
- сохранение slug/URL;
- поддержка externalId;
- возможность добавлять линейки товаров, например welded variants.

## 31. Revalidation and cache

Ключевые файлы:

- `lib/catalog/revalidate-products.ts`;
- `lib/revalidation.ts`;
- admin actions.

При изменении товара должны инвалидироваться:

- canonical product path;
- `/tovar/[slug]`;
- legacy `/catalog/[slug]`;
- category page;
- subcategory page;
- parent SEO landing/model page, если применимо;
- `/catalog`;
- `/`;
- `/sitemap.xml`.

При изменении категории/подкатегории:

- `/catalog`;
- category/subcategory pages;
- `/`;
- `/sitemap.xml`.

При изменении CMS:

- точная публичная страница;
- связанные metadata routes, если поле влияет на SEO.

При изменении сертификатов:

- `/certificates`;
- `/sitemap.xml`, если страница/URL влияет на sitemap.

## 32. Safe deletion

Товары:

- удаление доступно из списка и edit page;
- требуется подтверждение;
- связанные `product_images`, `product_specs`, aliases и другие product-linked rows должны удаляться через cascade или transaction;
- после удаления товар исчезает из каталога, поиска, sitemap и витрины.

Категории:

- нельзя удалить, если есть товары или подкатегории;
- пустую категорию можно удалить после подтверждения.

Подкатегории:

- нельзя удалить, если есть товары;
- пустую подкатегорию можно удалить после подтверждения.

Все проверки выполняются на сервере, не на клиенте.

## 33. SEO audit fixes and known SEO requirements

Заказчик получил SEO-аудит, который выявил:

- некорректные 301/зеркало;
- страницы пагинации;
- дубли meta title/description;
- слишком длинные meta tags;
- meta keywords;
- переспам категорий;
- low content categories;
- нерелевантные meta tags;
- каннибализацию запросов;
- layout issues;
- footer links на 500;
- стандартный 404;
- слабый ссылочный профиль.

Архитектурно уже заложены инструменты для исправления:

- `next.config.ts` / `proxy.ts` / route redirects для зеркала и legacy URL;
- `lib/seo/metadata.ts` для нормализации meta;
- `app/sitemap.ts` для canonical-only sitemap;
- `app/robots.ts` для открытия каталога и закрытия только служебных routes;
- no meta keywords;
- `app/not-found.tsx`;
- `docs/site-bug-audit.md`;
- `scripts/seo-audit.ts`.

Важно: внешние входящие ссылки не чинятся кодом сайта; это отдельная SEO/маркетинговая работа.

## 34. Environment variables

Core:

```text
SITE_URL
DATABASE_URL
PUBLIC_CATALOG_SOURCE
PUBLIC_CATALOG_FROM_DB
PUBLIC_CATALOG_ALLOW_JSON_FALLBACK
PUBLIC_CATALOG_RECOVERY_MODE
ADMIN_SESSION_SECRET
ADMIN_SESSION_TTL_HOURS
NEXT_PUBLIC_GTM_ID
NEXT_PUBLIC_GOOGLE_TAG_ID
NEXT_PUBLIC_GOOGLE_ADS_PHONE_CONVERSION_SEND_TO
NEXT_PUBLIC_GOOGLE_ADS_WHATSAPP_CONVERSION_SEND_TO
NEXT_PUBLIC_GOOGLE_ADS_EMAIL_CONVERSION_SEND_TO
NEXT_PUBLIC_GOOGLE_ADS_FORM_CONVERSION_SEND_TO
MEDIA_DRIVER
MEDIA_PUBLIC_BASE_URL
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_STORAGE_BUCKET
```

Defaults:

- `SITE_URL`: `https://mansvalve-group.kz`;
- `NEXT_PUBLIC_GTM_ID`: `GTM-KHXXZS38`;
- `NEXT_PUBLIC_GOOGLE_TAG_ID`: `AW-18163182394`;
- catalog source: DB if `DATABASE_URL` is configured, otherwise JSON.

Production recommended:

```text
PUBLIC_CATALOG_SOURCE=db
DATABASE_URL=postgresql://...
SITE_URL=https://mansvalve-group.kz
```

## 35. Deployment notes

Runtime:

- Next.js standalone or `next start` behind Nginx/Cloudflare;
- PM2 used on server in previous operations;
- Postgres local on server;
- static uploads served from `public/uploads` or Nginx alias;
- Cloudflare in front of origin.

Important server checks:

```bash
npm run build
npm run db:migrate
pm2 restart mansvalve --update-env
curl -I https://mansvalve-group.kz/robots.txt
curl -I https://mansvalve-group.kz/sitemap.xml
curl -I https://mansvalve-group.kz/uploads/...
```

Nginx must allow:

- adequate upload size for admin media;
- static serving for `/uploads/*`;
- canonical host redirects;
- no accidental blocking of catalog/product routes.

## 36. Quality and smoke checks

Standard:

```bash
npm run lint
npm run build
```

Functional smoke:

- `/`;
- `/catalog`;
- `/catalog/category/zadvizhki`;
- `/catalog/subcategory/...`;
- `/tovar/[slug]`;
- `/zadvizhki/[landingSlug]`;
- `/about`;
- `/contacts`;
- `/certificates`;
- `/thank-you-page`;
- `/robots.txt`;
- `/sitemap.xml`;
- `/admin/login`;
- `/admin/products`;
- `/admin/leads`;
- `/admin/media`.

Manual product consistency check:

1. Открыть товар в админке.
2. Сравнить public preview name/image/description с карточкой каталога.
3. Открыть canonical product page.
4. Открыть SEO/legacy route, если есть.
5. Проверить JSON-LD name/image/canonical.
6. Проверить, что поиск показывает то же имя.

Manual lead check:

1. Отправить public form.
2. Убедиться, что есть redirect на `/thank-you-page`.
3. Открыть `/admin/leads`.
4. Проверить статус `new`, имя, телефон, комментарий, source/page.
5. Убедиться, что даты в Asia/Almaty.

Manual media check:

1. Загрузить изображение в `/admin/media` или product/certificate form.
2. Проверить, что файл открывается по public URL.
3. Проверить, что картинка видна на public page.
4. Проверить, что primary image совпадает с public preview.

## 37. Документация внутри проекта

Важные документы:

| Документ | Назначение |
|---|---|
| `ARCHITECTURE.md` | Общая архитектура проекта |
| `docs/admin-public-content-map.md` | Карта CMS-полей public/admin |
| `docs/admin-public-data-map.md` | Карта admin-public data flow |
| `docs/product-content-contract.md` | Контракт контента товара |
| `docs/site-bug-audit.md` | Аудит багов и stability phases |
| `docs/runtime-stability-audit.md` | Runtime/reliability notes |
| `docs/performance-reliability-audit.md` | Performance/reliability audit |
| `docs/admin-product-management-roadmap.md` | Roadmap UX админки |
| `docs/catalog-templates.md` | Шаблоны каталога |
| `docs/project-status.md` | Текущее состояние проекта |

## 38. Основные риски для внешнего архитектора

1. Нельзя обходить `buildPublicProductView()` в публичном UI, metadata, sitemap, JSON-LD или admin preview.
2. Нельзя включать silent JSON fallback в production при DB source, иначе админка перестанет быть source of truth.
3. Нельзя сохранять generated fallback как ручной контент без явного действия менеджера.
4. Нельзя менять slug автоматически при правке публичного названия.
5. Нельзя добавлять новые Telegram-упоминания.
6. Нельзя грузить тяжелые документы/галереи в list DTO без необходимости.
7. Нельзя доверять client-side проверкам удаления категорий/товаров.
8. Нельзя добавлять SEO landing pages в sitemap без проверки canonical/active product/intentional support.
9. Нельзя смешивать technical attribution с маркетинговой атрибуцией в UI заявок.
10. Нельзя править favicon руками без генерации всего набора и проверки metadata.

## 39. Рекомендованный путь развития

При новых задачах:

1. Определить source of truth: DB, content_blocks, generated builder или config.
2. Проверить, какой public resolver должен читать данные.
3. Проверить admin form: не вводит ли оно менеджера в заблуждение.
4. Подключить revalidation точечно.
5. Проверить metadata/JSON-LD/sitemap.
6. Проверить search/list/detail consistency.
7. Запустить lint/build.
8. Добавить запись в docs, если меняется архитектурный контракт.

Для SEO:

1. Исправлять сначала 500/404/robots/canonical.
2. Потом metadata uniqueness и длины.
3. Потом category content и каннибализацию.
4. Потом внешние ссылки и контентную стратегию.

Для админки:

1. Не добавлять “сырые поля” без публичного preview.
2. Всегда подписывать internal/generated/public.
3. Показывать менеджеру, что именно увидит клиент.
4. Не делать page builder без отдельного архитектурного решения.
