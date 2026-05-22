# Архитектура проекта MANSVALVE GROUP

Обновлено: 2026-05-22  
Статус: AS-IS, актуально по текущему коду проекта.  
Аудитория: владелец проекта, техлид, разработчик, подрядчик по SEO/Ads.

## 1. Назначение

`MANSVALVE GROUP` — B2B-сайт поставщика промышленной трубопроводной арматуры в Казахстане.

Система объединяет:

- публичный сайт с маркетинговыми страницами, каталогом, SEO-посадочными и формами заявок;
- каталог товаров с фильтрами по типу товара, DN, PN, марке, материалу, соединению и управлению;
- SEO-инфраструктуру: metadata, JSON-LD, `sitemap.xml`, `robots.txt`, favicon/app icons;
- аналитику GA4/GTM и событийный трекинг;
- админ-панель для товаров, категорий, медиа, заявок, сертификатов и контент-блоков;
- интеграции с Telegram, Postgres/Drizzle, local/Supabase storage.

## 2. Стек

- Framework: Next.js 16 App Router.
- UI: React 19, TypeScript strict, Tailwind CSS v4.
- Components: shadcn/ui, Radix UI, lucide-react.
- Motion: framer-motion.
- DB: Postgres, Drizzle ORM, postgres driver.
- Auth: JWT в httpOnly cookie, jose, bcryptjs.
- Validation: zod.
- Analytics: GA4 `gtag.js` (measurement id по умолчанию `G-K08PEJC569` или `NEXT_PUBLIC_GA_MEASUREMENT_ID`), optional GTM через `NEXT_PUBLIC_GTM_ID`.
- Media: local storage или Supabase storage.
- Catalog source: JSON или DB через единый public adapter.

## 3. Слои

```text
app/
  routes, layouts, metadata, server actions, API routes

components/
  UI-компоненты, секции, формы, layout, catalog widgets, admin UI

lib/
  бизнес-логика, данные, адаптеры, services, search, SEO config, analytics

data/
  JSON-источник каталога

public/
  изображения, favicon, app icons, category visuals

scripts/
  генерация иконок, импорт/миграции/seed/smoke scripts
```

Правило проекта: UI не содержит бизнес-данные каталога и SEO-конфиги. Данные и правила вынесены в `lib/*`, UI получает готовые типизированные props.

## 4. Физическая структура

```text
mansvalve/
├── app/
│   ├── layout.tsx
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
│   │   ├── catalog/
│   │   │   ├── page.tsx
│   │   │   ├── [slug]/page.tsx
│   │   │   ├── [slug]/[subcategorySlug]/page.tsx
│   │   │   ├── [slug]/[subcategorySlug]/[productSlug]/page.tsx
│   │   │   ├── category/[categorySlug]/page.tsx
│   │   │   └── subcategory/[subcategorySlug]/page.tsx
│   │   ├── tovar/[slug]/page.tsx
│   │   ├── klapany/obratnye/[landingSlug]/page.tsx
│   │   └── [categorySlug]/[landingSlug]/page.tsx
│   ├── admin/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── login/
│   │   ├── catalog-health/
│   │   ├── products/ (+ import/, series/)
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
│   ├── icons/
│   ├── layout/
│   ├── motion/
│   ├── providers/
│   ├── search/
│   ├── sections/
│   ├── seo/
│   └── ui/
├── lib/
│   ├── auth/
│   ├── db/
│   ├── leads/
│   ├── public-catalog/
│   ├── search/
│   ├── services/
│   ├── site-content/
│   ├── storage/
│   ├── analytics.ts
│   ├── analytics-config.ts
│   ├── catalog-data.ts
│   ├── catalog-seo.ts
│   ├── category-content.ts
│   ├── category-visuals.ts
│   ├── company.ts
│   ├── media-image.ts
│   ├── media-url.ts
│   ├── motion.ts
│   ├── product-showcase.ts
│   ├── site-url.ts
│   ├── structured-data.ts
│   └── utils.ts
├── data/
│   ├── catalog-products.json
│   └── catalog-overrides.json
├── public/
│   ├── favicon.ico
│   ├── favicon.svg
│   ├── favicon-16.png
│   ├── favicon-32.png
│   ├── favicon-48.png
│   ├── icon.png
│   ├── apple-icon.png
│   ├── images/
│   └── category/product images
├── scripts/
│   ├── generate-brand-icons.mjs
│   ├── build-app-icons.mjs
│   ├── smoke-site-content.ts
│   └── db/
├── proxy.ts                 # Edge guard для /admin/* (Next.js 16, бывший middleware)
├── next.config.ts
├── drizzle.config.ts
├── package.json
└── ARCHITECTURE.md
```

## 5. Runtime layout

### Root layout

Файл: `app/layout.tsx`

Отвечает за:

- global metadata и favicon/app icons;
- `metadataBase` через `getSiteBaseUrl()`;
- Inter font;
- GA4 `gtag.js` + inline bootstrap (`send_page_view: false`);
- optional GTM bootstrap + noscript iframe;
- global JSON-LD `Organization` и `WebSite`;
- глобальные клиентские трекеры;
- toaster.

Важное решение: `send_page_view: false` для GA4. Page views отправляет собственный `PageViewTracker`, чтобы корректно учитывать App Router transitions и не получать дубли.

### Public site layout

Файл: `app/(site)/layout.tsx`

Отвечает за:

- public chrome: header, footer, floating WhatsApp;
- `PublicMotionProvider`;
- separation от admin layout.

### Admin layout

Файл: `app/admin/layout.tsx`

Отвечает за:

- admin sidebar/header;
- guard через server auth;
- изоляцию админки от публичного header/footer.

## 6. Публичные маршруты

| Route | Назначение |
|---|---|
| `/` | Главная B2B-страница |
| `/about` | О компании |
| `/contacts` | Контакты, карта, форма |
| `/certificates` | Сертификаты |
| `/delivery` | Доставка |
| `/privacy` | Политика конфиденциальности |
| `/terms` | Пользовательские условия |
| `/catalog` | Общий листинг каталога с фильтрами и пагинацией |
| `/catalog/category/[categorySlug]` | Листинг по категории (канонический путь категории) |
| `/catalog/subcategory/[subcategorySlug]` | Листинг по подкатегории |
| `/catalog/[categorySlug]` | **Диспетчер:** если `slug` — товар → **308** на канонический URL товара; если категория → листинг категории (см. `CatalogCategoryPage`) |
| `/catalog/[categorySlug]/[subcategorySlug]` | Листинг в контексте вложенной структуры URL |
| `/catalog/[categorySlug]/[subcategorySlug]/[productSlug]` | Карточка товара во вложенном URL; при несовпадении с `buildPublicProductView().canonicalPath` → **308** на канон |
| `/tovar/[slug]` | Основной публичный шаблон карточки товара для типового канона `/tovar/...` |
| `/[categorySlug]/[landingSlug]` | SEO landing pages (фильтры из конфига) |
| `/klapany/obratnye/[landingSlug]` | Отдельная ветка SEO-страниц для обратных клапанов |
| `/robots.txt` | Metadata route `app/robots.ts` |
| `/sitemap.xml` | Metadata route `app/sitemap.ts` |

## 7. SEO landing pages

Файл маршрута: `app/(site)/[categorySlug]/[landingSlug]/page.tsx`  
Конфиг: `lib/catalog-seo.ts`

Сейчас поддерживаются:

- `/zadvizhki/30ch6br`
- `/zadvizhki/30s41nzh`
- `/zadvizhki/s-elektroprivodom`
- `/zatvory/mezhflantsevye`
- `/flancy/ru16`

Каждая landing page описана как typed config:

```ts
interface CatalogLandingPage {
  categorySlug: string;
  slug: string;
  title: string;
  description: string;
  h1: string;
  filters: {
    categoryId: string;
    subcategoryId?: string;
    model?: string;
    pn?: number;
    material?: string;
    connectionType?: string;
    controlType?: string;
    q?: string;
  };
}
```

Страница использует `CatalogShell` с locked category/subcategory и search params из landing config.

## 8. Каталог

### Ключевые файлы

- `components/catalog/CatalogShell.tsx` — server-side orchestration: фильтрация, пагинация, JSON-LD item list.
- `lib/catalog-query/*` — движок запросов листинга (фасеты, DTO) при DB-режиме.
- `components/catalog/CatalogFilters.tsx` — client UI фильтров, URL state, debounce search.
- `components/catalog/ProductGrid.tsx` — список товаров.
- `components/catalog/ProductCard.tsx` — карточка товара.
- `components/catalog/FilterSelectMenu.tsx` — dropdown/mobile sheet для select-фильтров.
- `components/catalog/Pagination.tsx` — пагинация с query preservation.
- `lib/catalog-seo.ts` — SEO/taxonomy/filter constants, product title builder, landing pages.
- `lib/public-catalog/*` — единый adapter для JSON/DB.
- `lib/search/*` — поиск, fuzzy, DTO.

### Канонический URL товара

Единая логика: `buildPublicProductView()` в `lib/public-catalog/product-view.ts` → `buildProductDetailContent()` → `resolveProductCanonicalPath()` в `lib/product-detail-content.ts`:

- если товар привязан к **серии** (`getSeriesSeoPageForProduct`) → канон = путь серии (`getSeriesPagePath`);
- если категория `klapany` и задана подкатегория → канон = вложенный путь `catalogNestedProductPath("klapany", subcategory, slug)`;
- иначе → **`/tovar/[productSlug]`**.

Любой legacy URL (в т.ч. `/catalog/[slug]` только с slug товара) отдаёт **308** на `canonicalPath` + сохранение query string где применимо.

### Slug aliases

Файл: `lib/public-catalog/slug-aliases.ts`. При смене slug в админке старый slug может храниться в таблице алиасов; резолвер вычисляет текущий канонический путь и страницы товара выполняют **permanent redirect**.

### Фильтры

Фильтр каталога построен в порядке:

1. Поиск товара.
2. Категория.
3. Марка / модель.
4. Подкатегория, если route не locked на подкатегорию.
5. DN.
6. PN.
7. Материал.
8. Резьба, если есть в пуле.
9. Тип соединения.
10. Тип управления.

URL query параметры:

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

### SEO-названия товаров

Формирование: `buildProductCatalogName(product)` в `lib/catalog-seo.ts`.

Формат:

```text
[Тип товара] [материал] [марка] DN__ PN__ [соединение]
```

Используется:

- в карточках каталога;
- в product page H1;
- в WhatsApp inquiry text;
- в product metadata.

### Product SEO и страницы товара

Основные route handlers:

- `app/(site)/tovar/[slug]/page.tsx` — канон для `/tovar/...`;
- `app/(site)/catalog/[slug]/[subcategorySlug]/[productSlug]/page.tsx` — вложенный URL;
- `app/(site)/catalog/[slug]/page.tsx` — диспетчер категории vs legacy товарный slug → редирект.

Title / description / H1 собираются из `buildPublicProductView` (серии могут переопределять SEO).

Ключевые публичные страницы каталога/товара используют **`export const revalidate = 300`** (ISR ~5 минут), чтобы снизить нагрузку на БД и ускорить TTFB; после публикации в админке применяется точечный **`revalidatePath`** из server actions (см. действия сохранения товаров/категорий).

### Category SEO

Категорийные SEO overrides находятся в `CATEGORY_SEO` в `lib/catalog-seo.ts`.

Для `zadvizhki`:

- title: `Задвижки купить в Казахстане — чугунные и стальные | MANSVALVE GROUP`
- description: `Промышленные задвижки DN50-DN1000, PN16-PN64...`
- h1: `Задвижки промышленные в Казахстане`

### Быстрые ссылки категорий

`CATEGORY_QUICK_LINKS` в `lib/catalog-seo.ts`.

Для `zadvizhki` есть ссылки на:

- все задвижки;
- чугунные;
- стальные;
- с обрезиненным клином;
- с электроприводом;
- PN16, PN25, PN40, PN64.

## 9. Источник каталога

Публичный каталог читается только через `lib/public-catalog`.

```text
getPublicCatalogCategories()
getPublicCatalogProducts()
getPublicCatalogListingProducts()
getPublicProductBySlug()
getPublicCategoryBySlug()
getPublicSubcategoryBySlug()
getPublicProductsByCategory()
getPublicProductsBySubcategory()
```

Source selection:

- `PUBLIC_CATALOG_SOURCE=json` — `data/catalog-products.json` (+ overrides); режим **recovery / dev** когда БД недоступна или нужен зафиксированный снимок.
- `PUBLIC_CATALOG_SOURCE=db` — Postgres через Drizzle (рекомендуется для production после импорта и parity-check).
- legacy `PUBLIC_CATALOG_FROM_DB=true` тоже поддерживается.

JSON adapter:

- `lib/public-catalog/json-adapter.ts`
- `lib/catalog-data.ts`

DB adapter:

- `lib/public-catalog/db-adapter.ts`
- `lib/db/schema.ts`

Public types:

- `lib/public-catalog/types.ts`

## 10. Поиск

### Header search

Компонент: `components/search/CatalogSearchPanel.tsx`  
API: `app/api/search/products/route.ts`  
Server search: `lib/search/product-search.ts`  
DTO: `lib/search/product-search-dto.ts`

Используется для:

- desktop header search bar;
- mobile search modal;
- перехода на `/catalog?q=...`;
- перехода в карточку товара по подсказке.

### Catalog search

`CatalogShell` фильтрует текущий пул товаров по:

- name;
- material;
- connectionType;
- controlType;
- model;
- categoryName;
- subcategoryName;
- shortDescription;
- DN/PN в формате `dn100`, `pn16` и числом;
- thread.

Fuzzy: `lib/search/fuzzy.ts`.

## 11. Формы и заявки

### Quick request form

Компонент: `components/contacts/QuickRequestForm.tsx`  
API: `app/api/request/route.ts`

Поток:

```text
QuickRequestForm
  -> POST /api/request
  -> validation / honeypot / rate limit
  -> persistLeadSafely
  -> Telegram delivery
  -> updateLeadDelivery
```

Lead services:

- `lib/services/leads.ts` — server-only, DB operations;
- `lib/leads/lead-status-public.ts` — client-safe labels/normalization.

Важное правило: client components не импортируют `lib/services/leads.ts`.

## 12. Admin

Admin routes находятся в `app/admin`.

### Auth

- `proxy.ts` защищает `/admin/*` на Edge (JWT verify);
- `lib/auth/session.ts` — JWT session;
- `lib/auth/current-user.ts` — текущий admin;
- `lib/auth/password.ts` — bcrypt;
- cookie httpOnly.

### Разделы

| Раздел | Файлы |
|---|---|
| Login | `app/admin/login/*` |
| Dashboard | `app/admin/page.tsx` |
| Catalog health | `app/admin/catalog-health/page.tsx` |
| Products | `app/admin/products/*`, `import/`, `series/`, `components/admin/ProductForm.tsx` |
| Categories | `app/admin/categories/*`, `CategorySeoFields.tsx` |
| Certificates | `app/admin/certificates/*`, `CertificateForm.tsx` |
| Leads | `app/admin/leads/*`, `LeadEditForm.tsx` |
| Media | `app/admin/media/page.tsx`, API `app/api/admin/media/*` |
| Content | `app/admin/content/*`, `ContentSection.tsx` |
| Settings | `app/admin/settings/page.tsx` |

### Server actions

Server actions лежат рядом с admin routes:

- `app/admin/products/actions.ts`
- `app/admin/categories/actions.ts`
- `app/admin/certificates/actions.ts`
- `app/admin/leads/actions.ts`
- `app/admin/content/actions.ts`
- `app/admin/login/actions.ts`

## 13. Content blocks

Модель редактируемого контента:

- keys: `lib/site-content/keys.ts`;
- models/defaults/zod: `lib/site-content/models.ts`;
- public resolvers: `lib/site-content/public.ts`;
- DB service: `lib/services/content-blocks.ts`;
- admin editor: `app/admin/content/page.tsx`.

Принцип:

```text
DB content_blocks JSON payload
  -> zod parse
  -> merge with defaults
  -> public page props / metadata
```

Если БД не настроена или payload невалидный, публичный сайт использует defaults и не падает.

## 14. Media and storage

Services:

- `lib/services/media.ts`
- `lib/storage/index.ts`
- `lib/storage/local-driver.ts`
- `lib/storage/supabase-driver.ts`
- `lib/storage/types.ts`
- `lib/media-url.ts`
- `lib/media-image.ts`

Drivers:

- local filesystem;
- Supabase storage.

Media admin API:

- `app/api/admin/media/route.ts`
- `app/api/admin/media/[id]/route.ts`

## 15. SEO infrastructure

### Metadata

Root metadata: `app/layout.tsx`.  
Page metadata: `generateMetadata` в page files.

Используется:

- title templates;
- canonical URLs;
- description;
- OpenGraph;
- Twitter cards;
- favicon/app icons.

### JSON-LD

Component: `components/seo/JsonLd.tsx`  
Builders: `lib/structured-data.ts`

Типы:

- Organization;
- WebSite;
- CollectionPage;
- breadcrumbs;
- product;
- item list.

### Sitemap

Файл-генератор: `app/sitemap.ts`  
Публичный URL: `/sitemap.xml`

В sitemap входят:

- статические страницы;
- SEO landing pages;
- страницы категорий/подкатегорий каталога;
- канонические URL товаров (**`/tovar/[slug]`**, вложенные `/catalog/.../.../...` при необходимости);
- дедупликация через `uniqueSitemapEntries()`.

Base URL: `lib/site-url.ts`, default `https://mansvalve-group.kz`.

### Robots

Файл-генератор: `app/robots.ts`  
Публичный URL: `/robots.txt`

Правила:

- allow `/`;
- disallow `/admin/`;
- disallow `/api/`;
- disallow query duplicates `/*?*`;
- Googlebot-Image открыт для изображений и favicon assets;
- sitemap указан как `https://mansvalve-group.kz/sitemap.xml`;
- host: `mansvalve-group.kz`.

### Favicon and app icons

Source small mark: `scripts/brand/mansvalve-favicon.svg`.  
Generator: `scripts/generate-brand-icons.mjs`.

Generated public files:

- `public/favicon.ico`
- `public/favicon.svg`
- `public/favicon-16.png`
- `public/favicon-32.png`
- `public/favicon-48.png`
- `public/icon.png`
- `public/apple-icon.png`

Решение: для вкладки браузера metadata сначала отдаёт PNG `48/32/16`, затем SVG/ICO. `.ico` сохраняется как fallback для Google/старых клиентов.

## 16. Analytics

Config: `lib/analytics-config.ts`

```ts
GA_MEASUREMENT_ID = NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-K08PEJC569"
GTM_ID = NEXT_PUBLIC_GTM_ID || ""
```

Transport:

- GA4 direct via `gtag.js`;
- optional GTM via `dataLayer`;
- custom events через `trackEvent()`.

Files:

- `app/layout.tsx` — loads GA4/GTM scripts;
- `lib/analytics.ts` — `trackEvent`, payload normalization, session/event IDs;
- `components/analytics/PageViewTracker.tsx` — page_view, engagement, scroll depth, funnel steps;
- `components/analytics/GlobalClickTracker.tsx` — tel/WhatsApp/etc click tracking;
- catalog/search/forms call `trackEvent`.

Important:

- `send_page_view: false` in GA config;
- page views отправляются `PageViewTracker`;
- if GTM absent, GA4 still works;
- if GA4 absent but GTM present, dataLayer still works.

## 17. Company config

File: `lib/company.ts`

Contains:

- brand name;
- phone/email/address;
- WhatsApp URL builders;
- product inquiry text builders;
- optional public Telegram URL;
- SEO brand constants.

Rule: CTA links should use helpers from this file, not duplicate raw phone/WhatsApp URLs in UI.

## 18. Motion

Files:

- `lib/motion.ts`
- `components/motion/PublicMotionProvider.tsx`
- `components/motion/ScrollReveal.tsx`
- `components/motion/CssReveal.tsx`
- `components/motion/MotionRuntimeCheck.tsx`
- section client wrappers in `components/sections/*Client.tsx`
- `components/sections/ProductShowcaseCarousel.tsx`

Pattern:

- Server Components resolve data;
- Client wrappers apply framer-motion only where needed;
- `PublicMotionProvider` respects reduced motion globally;
- product carousel explicitly controls reduced-motion behavior.

## 19. Database

Schema: `lib/db/schema.ts`  
Client/core:

- `lib/db/client.ts`
- `lib/db/drizzle-core.ts`

Main tables include:

- admin users;
- categories;
- subcategories;
- products;
- product specs;
- product images;
- media assets;
- certificates;
- leads;
- content blocks;
- company settings;
- audit log.

Migrations:

- `lib/db/migrations/*`
- commands in `package.json`.

## 20. Scripts

Important scripts:

```text
npm run dev
npm run build
npm run lint
npm run catalog:rebuild
npm run db:generate
npm run db:migrate
npm run db:seed
npm run db:import-catalog
npm run admin:create
npm run catalog:parity-check
npm run seo:audit
npm run build:icons
npm run generate:icons
```

Script files:

- `scripts/generate-brand-icons.mjs` — current favicon/app icons generator;
- `scripts/build-app-icons.mjs` — legacy/auxiliary icon builder;
- `scripts/smoke-site-content.ts`;
- `scripts/db/*`;
- `scripts/rebuild_catalog.py`.

## 21. Environment variables

Core:

```text
SITE_URL
DATABASE_URL
PUBLIC_CATALOG_SOURCE
PUBLIC_CATALOG_FROM_DB
ADMIN_SESSION_SECRET
ADMIN_SESSION_TTL_HOURS
NEXT_PUBLIC_GA_MEASUREMENT_ID
NEXT_PUBLIC_GTM_ID
NEXT_PUBLIC_TELEGRAM_URL
TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID
MEDIA_DRIVER
MEDIA_PUBLIC_BASE_URL
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_STORAGE_BUCKET
```

Defaults:

- `SITE_URL` fallback: `https://mansvalve-group.kz`;
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` fallback: `G-K08PEJC569`;
- catalog fallback: JSON.

## 22. Build and quality

Expected checks:

```text
npm.cmd run lint
npm.cmd run build
```

Current known build warnings:

- Turbopack may warn about workspace root if multiple lockfiles exist.
- Turbopack may warn about NFT tracing through `next.config.ts -> lib/storage/local-driver.ts`.

These warnings do not currently fail production build.

## 23. Architectural rules for future work

1. Prefer Server Components by default.
2. Client Components only for interaction, browser APIs, state, tracking, forms, dropdowns, animation.
3. Keep catalog/SEO data in `lib/catalog-seo.ts` or public catalog adapters, not in UI.
4. Do not import server-only services into client components.
5. Use `lib/company.ts` for CTA/contact links.
6. Use `lib/public-catalog` as the only public catalog read entry.
7. Keep new admin mutations as server actions near their route.
8. Validate form/API input with zod.
9. Keep URL/canonical/sitemap changes in metadata routes/config, not hardcoded in components.
10. Regenerate icons through `npm run generate:icons`, do not manually edit generated PNG/ICO.

## 24. High-level request flow

```text
User browser
  -> Next.js route
    -> Server Component fetches data from lib/public-catalog / site-content / services
    -> UI components render
    -> Client components handle filters/search/forms/tracking
    -> API routes/server actions validate and call services
    -> DB/storage/Telegram/analytics integrations
```

## 25. Catalog request flow

```text
/catalog or landing/category route
  -> getPublicCatalogProducts()
  -> getPublicCatalogCategories()
  -> CatalogShell
    -> lock category/subcategory if route requires
    -> compute filter options
    -> apply query filters
    -> paginate
    -> emit ItemList JSON-LD
    -> CatalogFilters + ProductGrid
```

## 26. Lead request flow

```text
QuickRequestForm
  -> /api/request
    -> validate payload
    -> rate limit / honeypot
    -> create lead
    -> send Telegram notification
    -> update delivery status
    -> return success/error
```

## 27. SEO publishing flow

```text
Code/config update
  -> generateMetadata / sitemap / robots / JsonLd
  -> npm run build
  -> deploy
  -> Search Console: inspect main URLs and request indexing
```

For favicon specifically: index the page, not `/favicon.ico`; favicon just must be crawlable and linked from page metadata.

