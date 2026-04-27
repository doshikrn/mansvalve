# Архитектура проекта MANSVALVE (AS-IS)

Обновлено: 2026-04-27  
Аудитория: внешний архитектор / техлид, подключающийся к проекту.

> **Сводка состояния на дату обновления.** Одно приложение Next.js: публичный
> сайт (`app/(site)/*`) и админка (`app/admin/*`). Postgres + Drizzle для
> товаров, категорий, медиа, заявок и **контент-блоков** (`content_blocks`).
> Публичный каталог читается через **`lib/public-catalog`** с переключателем
> **`PUBLIC_CATALOG_SOURCE`** (`json` по умолчанию | `db`). Редактирование
> контента и **SEO-мета** (главная, about, contacts) — **`/admin/content`**
> (без page-builder): `content_blocks` + на публичных страницах — резолверы
> **`lib/site-content/public.ts`** **merge** с дефолтами из
> `lib/site-content/models.ts` (без БД, без строки, при невалидном JSON —
> дефолты; с частичной записью в БД — дозаполнение полей). Страница
> **политики конфиденциальности** — `/privacy` (текст в репо, `COMPANY` из
> `lib/company.ts`). Заявки: Telegram + строка в `leads`. Клиентские
> компоненты админки **не** импортируют `lib/services/leads.ts` (там
> `server-only`); подписи статусов и `normalizeLeadStatus` вынесены в
> **`lib/leads/lead-status-public.ts`**.

**Публичный поиск и бренд:** шапка вызывает **`GET /api/search/products`**
(роут `app/api/search/products/route.ts`) — на сервере
**`searchPublicProducts`** в `lib/search/product-search.ts` (тот же пул
публичных товаров, DTO `lib/search/product-search-dto.ts`). Листинг
`/catalog?q=…` в **`components/catalog/CatalogShell`** дополняет совпадения
fuzzy-логикой `lib/search/fuzzy.ts` (согласовано по смыслу с поисковым
хейстеком). Статика логотипа: **`public/images/logo-mansvalve.png`**. Иконки
вкладки: **`app/icon.png`**, `app/apple-icon.png` (см. [file conventions: metadata / app icons](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons));
в `app/layout.tsx` **не** дублируется `metadata.icons` — достаточно
file-based).

## 1) Назначение системы

`MANSVALVE` — B2B-сайт поставщика промышленной арматуры для Казахстана.

Текущее состояние:

- маркетинговый сайт (landing + доверительные блоки + CTA), часть текстов
  и **мета-описаний** главной, about, contacts **опционально** из БД
  (`content_blocks`); **шапка** — двухуровневый B2B-образец: служебная
  панель (серый фон, быстрые ссылки) + основная зона: логотип, **поиск по
  каталогу** с подсказками (`/api/search/products`) и CTA-контакты;
- каталог с фильтрами, пагинацией, страницами категорий/подкатегорий и
  карточками товаров — источник данных **JSON или БД** (флаг);
- серверный API для приёма заявок (`POST /api/request`) — Telegram +
  best-effort запись в `leads`;
- базовая web-аналитика: bootstrap GTM в `app/layout.tsx` при
  `NEXT_PUBLIC_GTM_ID`, события в `dataLayer` из `lib/analytics.ts`
  и клиентских трекеров (`PageViewTracker`, `GlobalClickTracker`, форма,
  `CatalogFilters`); при **отсутствии** `NEXT_PUBLIC_GTM_ID` скрипт GTM
  не грузится, `trackEvent` — no-op. SEO: metadata, JSON-LD, `sitemap`/`robots`.
- **админ-панель**: товары, категории/подкатегории, медиа, заявки, контент
  сайта, JWT-сессия.

## 2) Технологический стек

- Framework: `Next.js 16` (App Router, RSC, metadata routes).
- Runtime/UI: `React 19`, `TypeScript`, `Tailwind CSS v4`.
- UI: `shadcn/ui`, `radix-ui`, `lucide-react`.
- БД: Postgres, `drizzle-orm`, `postgres` (драйвер), миграции `drizzle-kit`.
- Auth админки: `jose` (JWT в httpOnly cookie), `bcryptjs`.
- Аналитика: GTM при `NEXT_PUBLIC_GTM_ID` → `dataLayer` (GA4/Ads настраиваются в GTM)
  (см. `lib/analytics.ts`).
- Линтинг: `ESLint` (`eslint-config-next`).
- Подключены точечно: `@supabase/supabase-js` (драйвер медиа Supabase),
  `zod` для валидации.

## 3) Физическая структура проекта (упрощённо)

```text
mansvalve/
├── app/
│   ├── layout.tsx                 # GTM, JSON-LD, трекеры, шрифты; без Header/Footer
│   ├── icon.png, apple-icon.png  # фавикон (file convention)
│   ├── (site)/                    # публичный сайт
│   │   ├── layout.tsx             # Header (2-ур., поиск) / Footer / Float WA
│   │   ├── page.tsx               # главная (+ generateMetadata из content)
│   │   ├── about/page.tsx         # + generateMetadata (meta из CMS)
│   │   ├── contacts/page.tsx      # + generateMetadata (meta из CMS)
│   │   ├── privacy/page.tsx       # политика конфиденциальности
│   │   └── catalog/**
│   ├── admin/
│   │   ├── layout.tsx
│   │   ├── login/
│   │   ├── products/**            # CRUD товаров
│   │   ├── categories/**          # CRUD категорий и подкатегорий (+ SEO)
│   │   ├── media/                 # загрузка и список медиа
│   │   ├── leads/**               # список, деталка, правка статуса/заметки
│   │   ├── content/               # правка site content (content_blocks)
│   │   └── ...
│   └── api/
│       ├── request/route.ts       # заявки
│       ├── search/products/       # GET: автодополнение для шапки (публичный)
│       └── admin/media/**
├── components/
│   ├── sections/*                 # Hero, TrustStrip, FAQ, RequestCTA …
│   ├── catalog/*
│   ├── contacts/QuickRequestForm.tsx
│   ├── analytics/*                # PageViewTracker, GlobalClickTracker
│   ├── admin/*                    # LeadEditForm, ProductForm, …
│   ├── layout/*                   # Header, Footer, FloatingWhatsApp
│   ├── search/CatalogSearchPanel  # bar + подсказки, modal (моб./поиск-иконка)
│   └── ui/*
├── lib/
│   ├── public-catalog/            # единая точка: JSON vs DB для витрины
│   ├── site-content/              # ключи, zod-модели, merge, server resolvers
│   ├── leads/lead-status-public.ts  # только UI/нормализация статуса (без БД)
│   ├── services/                  # products, categories, leads, content-blocks …
│   ├── db/                        # schema, client, migrations
│   ├── auth/*
│   ├── storage/*
│   ├── company.ts                 # реквизиты, tel/mail, wa.me, опц. публ. Telegram URL
│   ├── search/                    # product-search API + fuzzy, DTO
│   ├── analytics.ts               # trackEvent → dataLayer (GTM-флаг)
│   └── …
├── next.config.ts
├── public/images/                # бренд (логотип) и публичные картинки
├── data/catalog-products.json     # источник при PUBLIC_CATALOG_SOURCE=json
├── proxy.ts                       # guard /admin/*
├── drizzle.config.ts
├── scripts/db/*
├── scripts/smoke-site-content.ts  # merge-only smoke (без поднятия БД в tsx)
└── ARCHITECTURE.md
```

## 4) Логическая архитектура

```text
Browser
  -> Next.js App Router
      -> app/(site)/*  (RSC + часть секций async + resolve* из lib/site-content)
      -> app/admin/*   (RSC + server actions; клиент только там, где нужен)
      -> app/api/request  -> validate -> persistLeadSafely -> Telegram
      -> app/api/search/products  -> searchPublicProducts (клиент: шапка, карточки)
      -> lib/public-catalog  -> JSON файл или Drizzle-запросы
      -> lib/services/*      # server-only там, где помечено
```

### Слои

1. **Presentation** — страницы, секции, формы, админ-формы.
2. **Application** — server actions, оркестрация каталога, `revalidatePath`.
3. **Domain / public read** — `lib/site-content/models` (дефолты + merge),
   типы каталога из `public-catalog`.
4. **Integration** — Telegram, GTM, опционально Supabase Storage, Postgres.

## 5) Маршруты и точки входа (основные)

**Публичные**

- `GET /` — лендинг; hero / trust / FAQ / request CTA / meta главной —
  контент из БД при наличии настроенной БД и строк в `content_blocks`, иначе
  статические дефолты в коде.
- `GET /catalog` (query `q`, фильтры) — `CatalogShell`; `q` с той же семантикой,
  что и глобальный поиск, плюс `/catalog/category/...`, `/catalog/subcategory/...`,
  `/catalog/[slug]`.
- `GET /api/search/products?q&limit` — **публичный** JSON (автодополнение, без
  секрета; не путать с `TELEGRAM_*` для заявок).
- `GET /about`, `/contacts` — тексты и **metadata** (title/description) из
  `content_blocks` через `resolveAboutCopy` / `resolveContactsCopy` и
  `resolveAboutMeta` / `resolveContactsMeta` + merge с дефолтами.
- `GET /privacy` — политика конфиденциальности (статический контент + `COMPANY`).
- `POST /api/request` — заявка.
- `GET /robots.txt`, `GET /sitemap.xml`.

**Админка** (за `proxy.ts` + `requireAdmin`)

- `/admin/login`, `/admin`, `/admin/products`, `/admin/categories`, …
- **`/admin/content`** — формы по секциям (hero, trust, FAQ, CTA, meta главной,
  **meta about / meta contacts**, тексты about и contacts).

## 6) Модель данных

### Каталог (витрина)

- При **`PUBLIC_CATALOG_SOURCE=json`** (по умолчанию): чтение из
  `data/catalog-products.json` (+ хелперы совместимости).
- При **`db`**: чтение нормализованных сущностей из Postgres (категории,
  подкатегории, товары) через сервисный слой, используемый из
  `lib/public-catalog`.

### Таблицы админки / сайта (Drizzle, см. `lib/db/schema.ts`)

Ключевые сущности: `admin_users`, `categories`, `subcategories`, `products`,
`product_specs`, `product_images`, `media_assets`, **`leads`**,
**`content_blocks`** (ключ + `locale` + `jsonb` payload), `company_settings`,
`audit_log`.

### Контент сайта (`content_blocks`)

- Стабильные ключи — `lib/site-content/keys.ts` (например `site.home.hero`,
  `site.meta.home`, **`site.meta.about`**, **`site.meta.contacts`**, `site.about.copy`,
  `site.contacts.copy`, …).
- Схемы и значения по умолчанию — `lib/site-content/models.ts` (zod + merge).
- Публичное чтение — **`lib/site-content/public.ts`** (`resolveHomeHero`,
  `resolveHomeMeta`, `resolveAboutMeta`, `resolveContactsMeta`, `resolveTrustStrip`,
  …): если `DATABASE_URL` не задан или запись отсутствует / невалидна —
  используются дефолты (**публичный сайт без БД не ломается**); при частичном
  JSON в БД — **shallow merge** с дефолтами.

## 7) Основные потоки

1. **Рендер и SEO** — `generateMetadata` на `/`, `/about`, `/contacts` из
   `resolveHomeMeta()`, `resolveAboutMeta()`, `resolveContactsMeta()` (при
   непустом `SITE_URL` — корректные absolute URL через `metadataBase`).
2. **Каталог** — единый вход `getPublicCatalogCategories` /
   `getPublicCatalogProducts`; **поиск** — `CatalogSearchPanel` (шапка) +
   `trackEvent("catalog_search", { source: "header-bar" | "header-modal", … })`
   при GTM, `/catalog` с fuzzy.
3. **Заявки** — как раньше по UX, плюс запись в `leads` и обновление полей
   Telegram-доставки.
4. **Аналитика** — `trackEvent` пушит в `dataLayer` только при заданном
   **`NEXT_PUBLIC_GTM_ID`** (иначе no-op). GA4/Ads не подключаются в коде — только
   GTM. Трекинг кликов `tel:` / WhatsApp, просмотры страниц, форма, каталог — в
   прежних компонентах.
5. **Редактирование контента/мета** — `/admin/content` → server action →
   `upsertContentBlock` → `revalidatePath` для `/`, `/about`, `/contacts` и
   т.д.

## 8) Интеграции и окружение

**Публичный сайт и сборка**

- `SITE_URL`, `NEXT_PUBLIC_GTM_ID`, `NEXT_PUBLIC_TELEGRAM_URL` (опция: ссылка в
  панели шапки, не путать с `TELEGRAM_*` в заявках), `TELEGRAM_BOT_TOKEN`,
  `TELEGRAM_CHAT_ID` (полный перечень и чеклисты выката — `README.md`).

**БД и админка**

- `DATABASE_URL` — если пусто: публичный контент из дефолтов; админ-разделы,
  завязанные на БД, показывают сообщение о не настроенной БД.
- `ADMIN_SESSION_SECRET`, опционально `ADMIN_SESSION_TTL_HOURS`,
  `ADMIN_BOOTSTRAP_*` для первичного пользователя.

**Каталог**

- `PUBLIC_CATALOG_SOURCE` = `json` | `db` (устаревшее имя: `PUBLIC_CATALOG_FROM_DB=true`
  также переключает на БД, если явный `PUBLIC_CATALOG_SOURCE` не задан).

**Медиа**

- `MEDIA_DRIVER`, `MEDIA_PUBLIC_BASE_URL`, при Supabase — ключи проекта.

## 9) Нефункциональные характеристики

- **Сборка**: `next build` должен проходить без импорта `server-only` /
  `postgres` в клиентский бандл публичных/клиентских форм (см. раздел 13.4).
- **`next.config.ts`**: `poweredByHeader: false` (прочие детали деплоя — `README.md`).
- **Деградация**: отсутствие БД не отключает маркетинговый сайт за счёт
  fallback-контента и JSON-каталога.
- **Rate limit** заявок по-прежнему in-memory (ограничение для горизонтального
  масштаба).

## 10) Актуальные архитектурные ограничения

1. Тексты части marketing-секций (**WhyUs, HowItWorks, DeliveryCase, WhoWeSupply**,
   **Footer**) пока **не** в `content_blocks` (в отличие от home/about/contacts
   copy+meta, hero, FAQ, trust strip, request CTA, meta главной).
2. Rate limiter заявок — процесс-local.
3. Нет распределённого CI/e2e в репозитории (рекомендуется как следующий шаг
   качества).
4. Excel → каталог: по-прежнему цепочка через JSON-генерацию и импорт в БД, без
  прямого «живого» Excel-pipeline на проде.

## 11) Приоритеты следующего этапа (TO-BE, кратко)

1. Расширить CMS-покрытие (футер, оставшиеся секции лендинга) — по продукту.
2. Redis/edge KV для rate limiting и кэшей при необходимости.
3. CI: `lint`, `tsc`, `build`, smoke-сценарии.
4. ADR по хранению контента и каталога.

## 12) Быстрый технический чек-лист

- Dev: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Миграции: `npm run db:generate && npm run db:migrate`
- Админ: `npm run admin:create`
- Импорт каталога в БД: `npm run db:import-catalog`
- Smoke merge контента (без обязательной БД в процессе):  
  `npx tsx scripts/smoke-site-content.ts`

## 13) Админ-панель и данные (актуализация)

### 13.1 Концепция

- Префикс `/admin/*`, отдельный layout, JWT в httpOnly cookie, guard в
  `proxy.ts` + `requireAdmin()` в RSC/actions.
- Публичный сайт в `app/(site)/*` не смешивается с layout админки.

### 13.2 Реализованные возможности админки

- **Товары** — полный CRUD, server actions, zod.
- **Категории и подкатегории** — CRUD, SEO-поля, связь с публичными
  страницами категорий (где предусмотрено кодом).
- **Медиа** — загрузка, драйвер `local` / `supabase`, таблица `media_assets`.
- **Заявки** — список с фильтрами, детальная карточка, смена статуса и
  внутренней заметки через **`updateLeadAction`**; отображение legacy-статусов
  `won`/`lost` как «Завершена» через **`normalizeLeadStatus`**.
- **Контент сайта** — `/admin/content`: hero, trust strip, request CTA, FAQ,
  **meta главной (OG)**, **meta about / meta contacts (title, description)**,
  тексты about и contacts; хранение в **`content_blocks`**.

### 13.3 Публичное применение контента

- Секции **`Hero`**, **`TrustStrip`**, **`FAQ`**, **`RequestCTA`** — async
  server components, данные через `resolve*` из `lib/site-content/public.ts`.
- Страницы **`/about`**, **`/contacts`**, **`/`** — `generateMetadata` из
  `resolveHomeMeta` / `resolveAboutMeta` / `resolveContactsMeta` (merge с
  дефолтами в `lib/site-content/models.ts`).
- **`/privacy`** — статическая публичная страница; ссылка в **Footer**;
  не редактируется из `/admin/content`.
- Сервис **`lib/services/content-blocks.ts`** — `getContentBlock`,
  `upsertContentBlock`, опционально список по префиксу.

### 13.4 Разделение client / server (важно для сборки)

- **`lib/services/leads.ts`** помечен **`server-only`** и содержит Drizzle.
- Клиентский **`LeadEditForm`** и любые будущие клиентские модули **не должны**
  импортировать этот файл.
- Общие безопасные для клиента вещи (подписи статусов, нормализация enum для
  UI) лежат в **`lib/leads/lead-status-public.ts`** без `server-only` и без
  доступа к БД.

### 13.5 `lib/company.ts` и внешние CTA

- Единая точка **реквизитов**, `tel:`, e-mail, **`wa.me`** (номер в виде
  цифр, query `text` с `encodeURIComponent` в `buildCompanyWhatsAppUrl`),
  при необходимости **публичной ссылки Telegram**:
  `COMPANY_TELEGRAM_PUBLIC_HREF` (из `NEXT_PUBLIC_TELEGRAM_URL`), не смешивать
  с `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` для `POST /api/request`.
- Хелперы для **каталога** (запрос по товару) и **контактов** — в том же
  файле, чтобы ссылки на WhatsApp не дублировались. Визуальные CTA: плавающий
  виджет **`FloatingWhatsApp`**, плюс иконки/телефон в служебной панели шапки
  и блок «для заявок» / «оплата и доставка» в основной — без дублирования
  лишнего «ряда контактов» с теми же цифрами.

### 13.5.1 Публичная шапка и поиск

- **`Header`** (client) — `components/layout/Header.tsx`: `lg+` в центре
  `CatalogSearchPanel` (`variant: headerBar`), `Enter` / «Найти» ведут на
  `/catalog?q=...`, клик по подсказке — `/catalog/[slug]`. Ниже `lg` — иконка
  поиска (overlay `variant: modal`) + выезжающий блок с навигацией и
  заявками/контактами.
- **`/api/search/products`** — `app/api/search/products/route.ts`, тот же пул
  публичных товаров, что и витрина, без PII.

### 13.6 Поток заявки (без изменения смысла)

`QuickRequestForm` → `POST /api/request` → валидация / rate limit / honeypot
→ **`persistLeadSafely`** → Telegram → **`updateLeadDelivery`**.

### 13.7 Миграция каталога «JSON → БД»

- Импорт: `npm run db:import-catalog`.
- Переключение витрины: **`PUBLIC_CATALOG_SOURCE`** / legacy-флаг
  **`PUBLIC_CATALOG_FROM_DB`**.

### 13.8 Таблица `content_blocks` и `company_settings`

- Редактируемый маркетинговый контент слайса CMS хранится в **`content_blocks`**
  (JSON по ключу).
- **`company_settings`** в схеме есть; текущий слайс контента опирается на
  `content_blocks`, не на singleton настройки компании.

---

Документ отражает текущее состояние (AS-IS) на дату в шапке и может
использоваться как отправная точка для проектирования TO-BE архитектуры.
