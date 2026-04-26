# Архитектура проекта MANSVALVE (AS-IS)

Обновлено: 2026-04-24  
Аудитория: внешний архитектор / техлид, подключающийся к проекту.

> **Сводка состояния на дату обновления.** Одно приложение Next.js: публичный
> сайт (`app/(site)/*`) и админка (`app/admin/*`). Postgres + Drizzle для
> товаров, категорий, медиа, заявок и **контент-блоков** (`content_blocks`).
> Публичный каталог читается через **`lib/public-catalog`** с переключателем
> **`PUBLIC_CATALOG_SOURCE`** (`json` по умолчанию | `db`). Редактирование
> ключевого текстового контента сайта — **`/admin/content`** (без
> page-builder): данные в БД, на публичных страницах — резолверы
> **`lib/site-content/public.ts`** с **fallback на дефолты**, если БД выключена
> или блок не задан. Заявки: Telegram + строка в `leads`. Клиентские
> компоненты админки **не** импортируют `lib/services/leads.ts` (там
> `server-only`); подписи статусов и `normalizeLeadStatus` вынесены в
> **`lib/leads/lead-status-public.ts`**.

## 1) Назначение системы

`MANSVALVE` — B2B-сайт поставщика промышленной арматуры для Казахстана.

Текущее состояние:

- маркетинговый сайт (landing + доверительные блоки + CTA), часть текстов
  на главной / about / contacts **опционально** из БД;
- каталог с фильтрами, пагинацией, страницами категорий/подкатегорий и
  карточками товаров — источник данных **JSON или БД** (флаг);
- серверный API для приёма заявок (`POST /api/request`) — Telegram +
  best-effort запись в `leads`;
- базовая web-аналитика (GTM/dataLayer/gtag) и SEO (metadata + JSON-LD +
  sitemap/robots);
- **админ-панель**: товары, категории/подкатегории, медиа, заявки, контент
  сайта, JWT-сессия.

## 2) Технологический стек

- Framework: `Next.js 16` (App Router, RSC, metadata routes).
- Runtime/UI: `React 19`, `TypeScript`, `Tailwind CSS v4`.
- UI: `shadcn/ui`, `radix-ui`, `lucide-react`.
- БД: Postgres, `drizzle-orm`, `postgres` (драйвер), миграции `drizzle-kit`.
- Auth админки: `jose` (JWT в httpOnly cookie), `bcryptjs`.
- Аналитика: GTM/GA через `dataLayer` и `gtag`.
- Линтинг: `ESLint` (`eslint-config-next`).
- Подключены точечно: `@supabase/supabase-js` (драйвер медиа Supabase),
  `zod` для валидации.

## 3) Физическая структура проекта (упрощённо)

```text
mansvalve/
├── app/
│   ├── layout.tsx                 # общий chrome (GTM, JSON-LD, трекеры)
│   ├── (site)/                    # публичный сайт
│   │   ├── layout.tsx             # Header / Footer
│   │   ├── page.tsx               # главная (+ generateMetadata из content)
│   │   ├── about/page.tsx
│   │   ├── contacts/page.tsx
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
│       └── admin/media/**
├── components/
│   ├── sections/*                 # Hero, TrustStrip, FAQ, RequestCTA …
│   ├── catalog/*
│   ├── contacts/QuickRequestForm.tsx
│   ├── admin/*                    # LeadEditForm, ProductForm, …
│   ├── layout/*
│   └── ui/*
├── lib/
│   ├── public-catalog/            # единая точка: JSON vs DB для витрины
│   ├── site-content/              # ключи, zod-модели, merge, server resolvers
│   ├── leads/lead-status-public.ts  # только UI/нормализация статуса (без БД)
│   ├── services/                  # products, categories, leads, content-blocks …
│   ├── db/                        # schema, client, migrations
│   ├── auth/*
│   ├── storage/*
│   ├── company.ts
│   └── …
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
- `GET /catalog`, `/catalog/category/...`, `/catalog/subcategory/...`,
  `/catalog/[slug]`.
- `GET /about`, `/contacts` — часть текстов из `content_blocks` + fallback.
- `POST /api/request` — заявка.
- `GET /robots.txt`, `GET /sitemap.xml`.

**Админка** (за `proxy.ts` + `requireAdmin`)

- `/admin/login`, `/admin`, `/admin/products`, `/admin/categories`, …
- **`/admin/content`** — формы по секциям (hero, trust, FAQ, CTA, meta, about,
  contacts).

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
  `site.about.copy`, …).
- Схемы и значения по умолчанию — `lib/site-content/models.ts` (zod + merge).
- Публичное чтение — **`lib/site-content/public.ts`** (`resolveHomeHero`,
  `resolveTrustStrip`, …): если `DATABASE_URL` не задан или запись отсутствует
  / невалидна — используются дефолты (**публичный сайт без БД не ломается**).

## 7) Основные потоки

1. **Рендер и SEO** — metadata на `/` может браться из `resolveHomeMeta()`.
2. **Каталог** — единый вход `getPublicCatalogCategories` /
   `getPublicCatalogProducts`.
3. **Заявки** — как раньше по UX, плюс запись в `leads` и обновление полей
   Telegram-доставки.
4. **Аналитика** — без изменений концепции (dataLayer / gtag).
5. **Редактирование текстов** — админ сохраняет форму на `/admin/content` →
   server action → `upsertContentBlock` → `revalidatePath` для `/`, `/about`,
   `/contacts`, `/admin/content`.

## 8) Интеграции и окружение

**Публичный сайт и сборка**

- `SITE_URL`, `NEXT_PUBLIC_GTM_ID`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.

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
  `postgres` в клиентский бандл форм редактирования (см. раздел 13.11).
- **Деградация**: отсутствие БД не отключает маркетинговый сайт за счёт
  fallback-контента и JSON-каталога.
- **Rate limit** заявок по-прежнему in-memory (ограничение для горизонтального
  масштаба).

## 10) Актуальные архитектурные ограничения

1. Часть маркетинговых текстов (WhyUs, HowItWorks, футер, метаданные about/
   contacts и т.д.) пока **не** вынесена в `content_blocks`.
2. Rate limiter заявок — процесс-local.
3. Нет распределённого CI/e2e в репозитории (рекомендуется как следующий шаг
   качества).
4. Excel → каталог: по-прежнему цепочка через JSON-генерацию и импорт в БД, без
  прямого «живого» Excel-pipeline на проде.

## 11) Приоритеты следующего этапа (TO-BE, кратко)

1. Расширить CMS-покрытие (мета about/contacts, футер, оставшиеся секции) —
  приоритет по продукту.
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
  SEO главной, тексты about и contacts; хранение в **`content_blocks`**.

### 13.3 Публичное применение контента

- Секции **`Hero`**, **`TrustStrip`**, **`FAQ`**, **`RequestCTA`** — async
  server components, данные через `resolve*` из `lib/site-content/public.ts`.
- Страницы **`/about`**, **`/contacts`**, **`/`** (metadata) — используют те
  же резолверы / `generateMetadata` где подключено.
- Сервис **`lib/services/content-blocks.ts`** — `getContentBlock`,
  `upsertContentBlock`, опционально список по префиксу.

### 13.4 Разделение client / server (важно для сборки)

- **`lib/services/leads.ts`** помечен **`server-only`** и содержит Drizzle.
- Клиентский **`LeadEditForm`** и любые будущие клиентские модули **не должны**
  импортировать этот файл.
- Общие безопасные для клиента вещи (подписи статусов, нормализация enum для
  UI) лежат в **`lib/leads/lead-status-public.ts`** без `server-only` и без
  доступа к БД.

### 13.5 Поток заявки (без изменения смысла)

`QuickRequestForm` → `POST /api/request` → валидация / rate limit / honeypot
→ **`persistLeadSafely`** → Telegram → **`updateLeadDelivery`**.

### 13.6 Миграция каталога «JSON → БД»

- Импорт: `npm run db:import-catalog`.
- Переключение витрины: **`PUBLIC_CATALOG_SOURCE`** / legacy-флаг
  **`PUBLIC_CATALOG_FROM_DB`**.

### 13.7 Таблица `content_blocks` и `company_settings`

- Редактируемый маркетинговый контент слайса CMS хранится в **`content_blocks`**
  (JSON по ключу).
- **`company_settings`** в схеме есть; текущий слайс контента опирается на
  `content_blocks`, не на singleton настройки компании.

---

Документ отражает текущее состояние (AS-IS) на дату в шапке и может
использоваться как отправная точка для проектирования TO-BE архитектуры.
