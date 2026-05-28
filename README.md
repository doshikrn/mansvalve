# MANSVALVE — Сайт промышленной арматуры

Корпоративный B2B-сайт для продажи промышленной арматуры (задвижки, краны, затворы, клапаны) в Казахстане. Разработан на **Next.js 16 + Tailwind CSS v4 + shadcn/ui**.

---

## Демонстрация клиенту

### ✅ Что уже готово

| Блок | Статус |
|---|---|
| Главная, маркетинговые страницы, CMS (`content_blocks`), сертификаты | ✅ Готово |
| Каталог: листинг, фильтры, URL state, поиск в шапке, JSON или Postgres (`PUBLIC_CATALOG_SOURCE`) | ✅ Готово |
| Карточка товара: канон `/tovar/[slug]`, вложенные URL, серии SEO, `buildPublicProductView` | ✅ Готово |
| Legacy `/catalog/[slug]` для товара → редирект на канон; slug aliases | ✅ Готово |
| Админка: товары, категории (**sort_order**), импорт Excel, медиа, лиды, catalog health, серии | ✅ Готово |
| Форма заявки + `POST /api/request` + лиды в БД + админка | ✅ Готово |
| SEO: metadata, JSON-LD, sitemap, robots | ✅ Готово |
| Аналитика: Google tag (`gtag`, `send_page_view: false`) + опциональный GTM + `PageViewTracker` / `trackEvent` | ✅ Готово |
| Фотографии товаров | ⏳ По мере загрузки в медиатеку |
| Реальный номер телефона и WhatsApp в `lib/company` | ⏳ Проверить прод-значения |

Полная карта маршрутов, кэша и архитектуры: **`ARCHITECTURE.md`**. Индекс документации: **`docs/README.md`**, статус спринта: **`docs/project-status.md`**.

---

### 🚀 Как запустить проект локально

```bash
# 1. Перейти в папку проекта
cd mansvalve

# 2. Установить зависимости
npm install

# 3. Запустить dev-сервер
npm run dev

# 4. Открыть в браузере
# http://localhost:3000
```

**Требования:** Node.js 18+ / npm 9+

---

## Production configuration

Перед деплоем создайте `.env.local` на основе `.env.example` (или задайте те же
переменные в окружении хостинга):

```bash
# Linux/macOS
cp .env.example .env.local

# Windows (PowerShell)
Copy-Item .env.example .env.local
```

### Env variables (production summary)

Минимально required для production:

- `SITE_URL` — публичный базовый URL сайта (canonical/OG, `sitemap.xml`, `robots.txt`). Для production задайте канонический домен с `https` (сейчас: `https://mansvalve-group.kz`), **не** IP-адрес сервера.
- `DATABASE_URL` — строка подключения Postgres для admin/cms/leads.
- `ADMIN_SESSION_SECRET` — секрет подписи админ-сессий (длинная случайная строка).
- `NEXT_PUBLIC_GTM_ID` — публичный ID контейнера GTM (`GTM-XXXXXXX`).
- `NEXT_PUBLIC_GOOGLE_TAG_ID` — опционально; по умолчанию в коде задан Google tag ID `AW-18163182394` (см. `lib/analytics-config.ts`).
- `PUBLIC_CATALOG_SOURCE` — `json` или `db` (источник публичного каталога; см. `.env.example`).

Media storage (обязательно выбрать и настроить):

- `MEDIA_DRIVER`:
  - `local` — только для dev/тестов;
  - `supabase` — рекомендуемо для production.
- При `MEDIA_DRIVER=supabase`:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SUPABASE_STORAGE_BUCKET`
  - `MEDIA_PUBLIC_BASE_URL`
- При `MEDIA_DRIVER=local`:
  - убедитесь, что `MEDIA_PUBLIC_BASE_URL` корректен для вашего окружения (или оставьте fallback `/uploads`).
  - опционально можно задать `MEDIA_LOCAL_UPLOAD_ROOT` для явного пути хранения
    на диске (если процесс запускается не из папки Next.js приложения).

Важно:

- Если `NEXT_PUBLIC_GTM_ID` пустой: GTM не грузится, analytics events безопасно no-op.
- Если `DATABASE_URL` не задан: форма вернёт ошибку, потому что source of truth для заявок — Postgres и раздел `/admin/leads`.
- Если `DATABASE_URL`/`ADMIN_SESSION_SECRET` не заданы: админка и управление контентом не готовы к production.

Локальная совместимость (для старых инсталляций):

- Текущая логика локального драйвера пишет в `public/uploads/...` **внутри Next app root**.
- Если раньше файлы писались из другого `cwd` и оказались вне текущего `public/uploads`,
  переместите их в актуальную папку `public/uploads` или задайте корректный
  `MEDIA_LOCAL_UPLOAD_ROOT` и синхронизируйте `MEDIA_PUBLIC_BASE_URL`.

### Step-by-step deployment guide

1. **Подготовьте окружение**
   - Заполните все переменные из блока выше.
   - Для production не храните секреты в репозитории; задайте их в панели хостинга.
2. **Локально проверьте сборку**
   - `npm ci`
   - `npm run build`
   - `npm run start`
   - Откройте `http://localhost:3000` и сделайте базовый smoke-test.
3. **Задеплойте на хостинг**
   - Загрузите текущую ветку/релиз.
   - Пропишите production env vars в проекте хостинга.
   - Убедитесь, что health-check/лог старта без runtime errors.
4. **Настройте домен**
   - Привяжите production-домен в хостинге.
   - Проверьте, что сайт доступен по `https://<your-domain>`.
   - Установите `SITE_URL=https://<your-domain>` и перезапустите деплой.
5. **Проверьте runtime**
   - Открываются public страницы.
   - Работает `POST /api/request`.
   - Работает `/admin/login`.

### Cloudflare setup checklist

- **DNS**
  - [ ] Добавьте DNS запись (`A`/`CNAME`) на хостинг.
  - [ ] TTL по умолчанию (Auto) на этапе запуска.
- **Proxy**
  - [ ] Включите orange cloud для публичного домена.
  - [ ] Убедитесь, что SSL mode = `Full (strict)`.
- **Caching basics**
  - [ ] Включен стандартный Cache на статику (`_next/static`, изображения, шрифты).
  - [ ] Не кэшируйте HTML агрессивно до завершения QA.
  - [ ] После выката делайте selective purge при необходимости.
- **Security basics**
  - [ ] Включен Always Use HTTPS.
  - [ ] Включен Automatic HTTPS Rewrites.
  - [ ] Минимум: Security Level `Medium`, Browser Integrity Check ON.
  - [ ] Добавьте базовые WAF managed rules (без агрессивных кастомных блокировок на старте).
  - [ ] Проверьте, что `/api/request` не блокируется WAF/Rate Limiting по ошибке.

### Post-deploy QA checklist

- [ ] **Homepage**: `/` рендерится без ошибок, CTA и навигация работают.
- [ ] **Catalog**: `/catalog`, `/catalog/category/...`, `/catalog/subcategory/...`, вложенные `/catalog/.../.../...` при необходимости.
- [ ] **Product pages**: канон **`/tovar/[slug]`**; убедиться, что старый `/catalog/[slug]` для товара **редиректит** на канон, метаданные и цена корректны.
- [ ] **Forms**: отправка заявки через сайт, валидация, fallback в WhatsApp при ошибке.
- [ ] **Admin login**: `/admin/login` авторизация проходит, сессия сохраняется.
- [ ] **Lead creation**: после формы лид появляется в `/admin/leads`, админка delivery статус корректен.
- [ ] **GTM Preview**: Tag Assistant видит контейнер, ключевые события (`page_view`, `catalog_view`, `product_view`, `request_form_*`, `whatsapp_click`, `phone_click`) приходят.

---

## Проверка аналитики (GTM / GA4) перед/после хостинга

Убедитесь, что при необходимости заданы `NEXT_PUBLIC_GTM_ID` и/или `NEXT_PUBLIC_GOOGLE_TAG_ID` (см. `.env.example`), затем пройдите чеклист в **GTM Preview** (Tag Assistant) на целевом домене.

| Шаг | Что проверить |
|-----|----------------|
| 1 | **GTM Preview** подключён к контейнеру, сайт открыт без блокировщиков; в консоли нет ошибок от `googletagmanager.com`. |
| 2 | **`page_view`** — на первом заходе и при **переходах SPA** (главная → каталог → товар); в payload есть `page`, `pathname`, `source: app-router`. |
| 3 | **`catalog_view`** — на `/catalog` и на `/catalog/category/...` (см. `PageViewTracker`). |
| 4 | **`product_view`** — на канонической странице товара (обычно `/tovar/[slug]` или вложенный URL; дополняет `page_view`, есть `product_slug`). |
| 5 | **`request_form_view`** — форма заявки попала в зону видимости (IntersectionObserver; прокрутите к форме). |
| 6 | **`request_form_submit_success`** — успешная отправка `POST /api/request`. |
| 7 | **`request_form_submit_error`** — ответ с ошибкой от API (или имитация). |
| 8 | **`whatsapp_click`** — клик по ссылке `wa.me` / WhatsApp (также дублируется при программном fallback в форме). |
| 9 | **`phone_click`** — клик по `tel:`. |
| 10 | **`catalog_search`** — поиск в каталоге. |
| 11 | **`catalog_filter_change`** — смена фильтра (категория, подкатегория, сортировка и т.д., см. `CatalogFilters`). |
| 12 | Для событий из `lib/analytics.ts` в dataLayer: на каждом событии есть **`event_id`**, **`session_id`**, **`page`**, **`pathname`**, при необходимости **`product_slug`** / **`category`** / **`source`**. Настройте в GTM триггеры и теги GA4 / Google Ads по этим именам `event`. |

**Readiness:** GTM-контейнер `GTM-KHXXZS38` задан в коде по умолчанию; `NEXT_PUBLIC_GTM_ID` нужен только для явной замены контейнера. `trackEvent` пишет события в `dataLayer`, а просмотры страниц идут через `PageViewTracker`.

## Analytics / Ads / Retargeting handoff

Идентификаторы (для маркетинга и настройки GTM / GA4 / Google Ads):

| | ID |
|---|-----|
| **GTM (контейнер)** | `GTM-KHXXZS38` |
| **Google tag / Ads** | `AW-18163182394` |
| **Ads conversion default** | `AW-18163182394/BBtnCPz4nLMcELrW8NRD` |
| **Env в приложении** | `NEXT_PUBLIC_GTM_ID=GTM-KHXXZS38`; `NEXT_PUBLIC_GOOGLE_TAG_ID=AW-18163182394` используется только как fallback, если GTM отключён |

**Важно:** **GTM** подключается через `next/script` в `app/layout.tsx` и является основным транспортом аналитики. Прямой **Google tag / Ads** через `gtag.js` используется только как fallback, если GTM отключён. Пользовательские события из `lib/analytics.ts` отправляются в **`dataLayer`**. Конверсии Ads настраиваются в GTM по событиям `phone_click`, `whatsapp_click` и `request_form_submit_success`; отдельные labels для fallback-gtag можно задать через `NEXT_PUBLIC_GOOGLE_ADS_PHONE_CONVERSION_SEND_TO`, `NEXT_PUBLIC_GOOGLE_ADS_WHATSAPP_CONVERSION_SEND_TO`, `NEXT_PUBLIC_GOOGLE_ADS_FORM_CONVERSION_SEND_TO`.

**События `dataLayer` (имя `event`), которые эмитит фронтенд:**

| Событие | Назначение |
|---------|------------|
| `page_view` | Просмотр страницы (в т.ч. при навигации в App Router) |
| `catalog_view` | Витрина каталога: `/catalog`, `/catalog/category/...` |
| `product_view` | Каноническая карточка товара (например `/tovar/[slug]`) |
| `request_form_view` | Форма заявки вошла в зону видимости |
| `request_form_submit_success` | **Основная конверсия (lead):** успешный `POST /api/request` |
| `request_form_submit_error` | Ошибка отправки формы |
| `whatsapp_click` | Клик по ссылке WhatsApp (и программный fallback в форме) |
| `phone_click` | Клик по `tel:` |
| `catalog_search` | Поиск в каталоге (debounce) |
| `catalog_filter_change` | Смена фильтра / таба категории / сброс |
| *Дополнительно* | `scroll_depth`, `page_engagement` — вовлечённость, не обязательны для конверсий |

**Поля на каждом событии (для дедупликации и атрибуции):** `event_id`, `session_id`, `page` (путь + query), `pathname`; при релевантности — `product_slug`, `category`, `source`.

**Конверсии:**

- **Основная (macro):** `request_form_submit_success` — настройка цели/конверсии в GA4 и, при необходимости, импорт в Google Ads.
- **Микроконверсии:** `whatsapp_click`, `phone_click` — полезны для воронки и аукциона, не заменяют lead.

---

## Lighthouse (Chrome DevTools) — чеклист перед продом

Соберите **production** (`npm run build` → `npm run start`) или смотрите **preview** на хостинге; в Lighthouse выберите модель **мобильного** устройства. Проверьте категории (цели-ориентиры зависят от контента и CDN, ориентируйтесь на отсутствие «красных» критичных инцидентов и регрессий после выката):

| Категория | На что смотреть |
|-----------|-----------------|
| **Performance (mobile)** | LCP на главной и на карточке товара; лишние long tasks; не загружайте 4G-throttle в первом прогоне, затем — «Slow 4G» для реалистичности. |
| **Accessibility** | контраст, подписи кнопок/иконок, `alt` у изображений, порядок фокуса на форме заявки. |
| **Best Practices** | отсутствие ошибок в консоли, HTTPS, актуальные политики для сторонних скриптов (GTM/GA4). |
| **SEO** | `meta` / canonical на ключевых URL, индексируемые страницы, корректный `robots.txt` при `SITE_URL`. |

**Ключевые URL для прогона:** `/` (главная), `/catalog`, типичная **`/tovar/[slug]`**, `/contacts`, `/about`, одна страница категории и подкатегории, один SEO-лендинг (например `/zadvizhki/...` если включён в конфиге).

---

### 👁️ Что показать клиенту в первую очередь

**Маршрут демонстрации (≈ 15 минут):**

1. **Главная страница** (`/`)
   - Профессиональный hero с реальными УТП из брифа
   - Блок «Почему MANSVALVE» — 4 преимущества
   - Превью каталога — 6 категорий

2. **Каталог товаров** (`/catalog`)
   - Фильтры, сортировка, пагинация, поиск
   - Переход в каноническую карточку **`/tovar/[slug]`** (или вложенный URL для отдельных категорий)

3. **Схема работы** (прокрутить на главной)
   - 5 шагов, взятых дословно из брифа клиента

4. **Форма заявки** (прокрутить вниз)
   - Поля: имя, телефон, комментарий
   - Интеграция с WhatsApp

5. **Мобильная версия** — открыть в DevTools → Mobile view

---

### 🔧 Перед запуском проверить

- [ ] Контакты и WhatsApp в `lib/company` / настройках — боевые значения
- [ ] `SITE_URL`, `DATABASE_URL`, `PUBLIC_CATALOG_SOURCE=db` на production
- [ ] Миграции БД применены (`npm run db:migrate`), каталог импортирован при необходимости
- [ ] Медиа-драйвер production (`MEDIA_DRIVER=supabase`) и bucket
- [ ] GTM/GA env заданы на хостинге

---

## Стек технологий

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui (Button, Card, Dialog, etc.)
- **Icons:** lucide-react
- **Database:** Postgres (часто Supabase) + Drizzle ORM
- **SEO / metadata:** Next.js `Metadata` API, JSON-LD в `lib/structured-data.ts`

## Структура проекта (кратко)

```
mansvalve/
├── app/                    # App Router: (site), admin, api, sitemap, robots
├── components/             # UI: catalog, admin, sections, analytics, seo
├── lib/                    # Каталог, БД, CMS, поиск, аналитика, storage
├── data/                   # JSON снимок каталога (режим json)
├── docs/                   # Документация (см. docs/README.md)
├── scripts/                # Импорт, миграции, иконки, аудиты
└── public/                 # Статика, uploads (local media)
```

Подробная карта файлов и потоков: **`ARCHITECTURE.md`**.

## Каталог данных

- **Режим `PUBLIC_CATALOG_SOURCE=json`:** чтение из `data/catalog-products.json` (+ overrides) через адаптер в `lib/public-catalog`.
- **Режим `PUBLIC_CATALOG_SOURCE=db`:** категории/товары из Postgres (см. `lib/db/schema.ts`, импорт `npm run db:import-catalog`).
- Публичный код **не** читает каталог напрямую из `lib/catalog-data.ts` — только через **`lib/public-catalog`** (`buildPublicProductView`, listing DTO и т.д.).
- Утилиты совместимости и типы для JSON-миграций могут жить в `lib/catalog-data.ts` / смежных модулях — см. код адаптера.

---

## Команды разработки

```bash
npm run dev      # Dev-сервер на порту 3000
npm run build    # Production сборка
npm run lint     # Проверка ESLint
```
