# MANSVALVE — Сайт промышленной арматуры

Корпоративный B2B-сайт для продажи промышленной арматуры (задвижки, краны, затворы, клапаны) в Казахстане. Разработан на **Next.js 16 + Tailwind CSS v4 + shadcn/ui**.

---

## Демонстрация клиенту

### ✅ Что уже готово

| Блок | Статус |
|---|---|
| Главная страница (hero, УТП, схема работы, FAQ, форма) | ✅ Готово |
| Каталог товаров — 303 позиции с ценами в тенге | ✅ Готово |
| Структура категорий (6 кат., 15 подкатегорий) | ✅ Готово |
| Карточки товаров (DN, PN, материал, вес, specs) | ✅ Данные готовы |
| Форма заявки | ✅ Вёрстка готова |
| WhatsApp-кнопка (фиксированная на всех страницах) | ✅ Готово |
| SEO-метаданные (title, description, OG) | ✅ Готово |
| Адаптивный дизайн (мобильная версия) | ✅ Готово |
| Шрифт Inter + профессиональная типографика | ✅ Готово |
| Демо-плашка в dev-режиме | ✅ Готово |
| Фотографии товаров | ⏳ Нужны реальные фото |
| Реальный номер телефона и WhatsApp | ⏳ Заменить плейсхолдер |
| Страница /catalog (маршрутизация) | ⏳ Роуты в разработке |
| Страница /catalog/[slug] (карточка товара) | ⏳ В разработке |
| Отправка формы заявки (backend / Supabase) | ⏳ В разработке |
| Google Analytics / Google Ads пиксель | ⏳ После деплоя |

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
- `TELEGRAM_BOT_TOKEN` — server-only токен Telegram-бота для `POST /api/request`.
- `TELEGRAM_CHAT_ID` — server-only chat ID для получения заявок.
- `NEXT_PUBLIC_GTM_ID` — публичный ID контейнера GTM (`GTM-XXXXXXX`).

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
- Если Telegram-переменные не заданы: форма может открыть WhatsApp fallback, но это не замена рабочей server delivery.
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
- [ ] **Catalog**: `/catalog`, `/catalog/category/...`, `/catalog/subcategory/...` открываются и фильтры работают.
- [ ] **Product pages**: `/catalog/[slug]` корректно рендерит SEO, цену/“по запросу”, CTA.
- [ ] **Forms**: отправка заявки через сайт, валидация, fallback в WhatsApp при ошибке.
- [ ] **Admin login**: `/admin/login` авторизация проходит, сессия сохраняется.
- [ ] **Lead creation**: после формы лид появляется в `/admin/leads`, Telegram delivery статус корректен.
- [ ] **GTM Preview**: Tag Assistant видит контейнер, ключевые события (`page_view`, `catalog_view`, `product_view`, `request_form_*`, `whatsapp_click`, `phone_click`) приходят.

---

## Проверка аналитики (GTM / GA4) перед/после хостинга

Убедитесь, что в окружении задан `NEXT_PUBLIC_GTM_ID` (см. `.env.example`), затем пройдите чеклист в **GTM Preview** (Tag Assistant) на целевом домене.

| Шаг | Что проверить |
|-----|----------------|
| 1 | **GTM Preview** подключён к контейнеру, сайт открыт без блокировщиков; в консоли нет ошибок от `googletagmanager.com`. |
| 2 | **`page_view`** — на первом заходе и при **переходах SPA** (главная → каталог → товар); в payload есть `page`, `pathname`, `source: app-router`. |
| 3 | **`catalog_view`** — на `/catalog` и на `/catalog/category/...` (см. `PageViewTracker`). |
| 4 | **`product_view`** — на странице товара `/catalog/[slug]` (дополняет `page_view`, есть `product_slug`). |
| 5 | **`request_form_view`** — форма заявки попала в зону видимости (IntersectionObserver; прокрутите к форме). |
| 6 | **`request_form_submit_success`** — успешная отправка `POST /api/request`. |
| 7 | **`request_form_submit_error`** — ответ с ошибкой от API (или имитация). |
| 8 | **`whatsapp_click`** — клик по ссылке `wa.me` / WhatsApp (также дублируется при программном fallback в форме). |
| 9 | **`phone_click`** — клик по `tel:`. |
| 10 | **`catalog_search`** — поиск в каталоге. |
| 11 | **`catalog_filter_change`** — смена фильтра (категория, подкатегория, сортировка и т.д., см. `CatalogFilters`). |
| 12 | Для событий из `lib/analytics.ts` в dataLayer: на каждом событии есть **`event_id`**, **`session_id`**, **`page`**, **`pathname`**, при необходимости **`product_slug`** / **`category`** / **`source`**. Настройте в GTM триггеры и теги GA4 / Google Ads по этим именам `event`. |

**Readiness:** без `NEXT_PUBLIC_GTM_ID` клиентский слой событий отключён, сайт не падает. С GTM — bootstrap в `app/layout.tsx`, события **только** в `dataLayer` (без дублирования через `gtag` в коде приложения).

## Analytics / Ads / Retargeting handoff

Идентификаторы (для маркетинга и настройки GTM / GA4 / Google Ads):

| | ID |
|---|-----|
| **GTM (контейнер)** | `GTM-NJZFLQSV` |
| **GA4 (поток)** | `G-K08PEJC569` |
| **Env в приложении** | `NEXT_PUBLIC_GTM_ID=GTM-NJZFLQSV` (публичная переменная) |

**Важно:** в репозитории **нет** прямых скриптов Google Ads / gtag / GA4 — только GTM. Ремаркетинг, конверсии и теги GA4 настраиваются **в GTM и интерфейсе Google Ads** маркетологом. Код пушит события в `dataLayer`; дальше маршрутизация — на стороне GTM.

**События `dataLayer` (имя `event`), которые эмитит фронтенд:**

| Событие | Назначение |
|---------|------------|
| `page_view` | Просмотр страницы (в т.ч. при навигации в App Router) |
| `catalog_view` | Витрина каталога: `/catalog`, `/catalog/category/...` |
| `product_view` | Карточка товара `/catalog/[slug]` |
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

**Ключевые URL для прогона:** `/` (главная), `/catalog`, типичная `/catalog/[slug]`, `/contacts`, `/about`, а также **одна** страница категории и подкатегории из каталога. После смены изображений или шрифтов — повторить выборочно.

---

### 👁️ Что показать клиенту в первую очередь

**Маршрут демонстрации (≈ 15 минут):**

1. **Главная страница** (`/`)
   - Профессиональный hero с реальными УТП из брифа
   - Блок «Почему MANSVALVE» — 4 преимущества
   - Превью каталога — 6 категорий

2. **Каталог товаров** (`/catalog`) ← *в разработке, показать структуру*
   - 303 реальных товара с ценами в тенге
   - Правильные названия: «Задвижка чугунная 30ч6бр DN150 PN16»
   - Фильтрация по DN, PN, материалу, категории

3. **Схема работы** (прокрутить на главной)
   - 5 шагов, взятых дословно из брифа клиента

4. **Форма заявки** (прокрутить вниз)
   - Поля: имя, телефон, комментарий
   - Интеграция с WhatsApp

5. **Мобильная версия** — открыть в DevTools → Mobile view

---

### 🔧 Что будет доработано перед запуском

- [ ] Заменить номер телефона `+7 (700) 123-45-67` на реальный
- [ ] Заменить ссылку WhatsApp на реальный номер
- [ ] Добавить реальные фотографии товаров (или качественные стоковые)
- [ ] Создать страницы каталога (`/catalog`, `/catalog/[category]`, `/catalog/[category]/[slug]`)
- [ ] Подключить отправку заявок (Supabase / email / Telegram-бот)
- [ ] Добавить логотип компании вместо иконки
- [ ] Заполнить страницы «О компании» и «Контакты»
- [ ] Настроить Google Analytics и Google Ads конверсии
- [ ] SSL + хостинг (Vercel или собственный сервер)

---

## Стек технологий

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui (Button, Card, Dialog, etc.)
- **Icons:** lucide-react
- **Database:** Supabase (подключён, настройка заявок — в разработке)
- **Font:** Inter (Cyrillic subset)
- **SEO:** next-seo

## Структура проекта

```
mansvalve/
├── app/
│   ├── layout.tsx       # Root layout: Inter font, metadata, DemoNotice
│   ├── page.tsx         # Главная страница
│   └── globals.css      # Tailwind + shadcn theme
├── components/
│   ├── DemoNotice.tsx   # Плашка "демо-версия" (только в dev)
│   └── ui/              # shadcn компоненты
└── lib/
    └── catalog-data.ts  # 303 товара из Excel + категории + хелперы
```

## Каталог данных

Файл `lib/catalog-data.ts` содержит:
- **303 уникальных товара** с реальными ценами из Excel
- Правильный формат названий: `Тип + модель + DN + PN`
- Поля: `id, name, slug, category, subcategory, dn, pn, material, price, priceByRequest, weight, specs, shortDescription`
- **125 товаров** с `priceByRequest: true` (цена < 50 000 ₸ или не указана)
- Хелперы: `getProductsByCategory()`, `getProductBySlug()`, `searchProducts()`

---

## Команды разработки

```bash
npm run dev      # Dev-сервер на порту 3000
npm run build    # Production сборка
npm run lint     # Проверка ESLint
```
