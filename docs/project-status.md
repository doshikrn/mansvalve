# Project status — MANSVALVE (срез 2026-05-22)

Краткий статус для онбординга и планирования. Детали — в `ARCHITECTURE.md` и `README.md`.

## Реализовано и стабилизировано

- **Публичный сайт:** маркетинговые страницы в группе маршрутов `(site)`, общий layout без админского chrome.
- **Каталог:** листинг `/catalog`, фильтры и URL-параметры, пагинация, поиск в шапке (`/api/search/products`), данные только через `lib/public-catalog`.
- **Канонические URL товара:** `/tovar/[slug]` (основной шаблон), вложенные пути `/catalog/[category]/[subcategory]/[product]` где задано правилом (например клапаны с подкатегорией), SEO-страницы **серий** из `lib/seo-product-pages/product-series` при наличии привязки товара к серии.
- **Legacy входы:** `/catalog/[slug]` для старого slug товара → **308** на канон; алиасы slug → текущий slug через `resolveProductSlugAliasTarget` + редирект.
- **SEO-лендинги:** `/[categorySlug]/[landingSlug]` и отдельные ветки вроде `/klapany/obratnye/[landingSlug]` по конфигу.
- **Источник каталога:** `PUBLIC_CATALOG_SOURCE=json|db` (+ legacy `PUBLIC_CATALOG_FROM_DB`); JSON — дефолт для совместимости; DB — для production после миграций и импорта.
- **Админка:** товары (в т.ч. Excel import), категории/подкатегории с **sort_order**, медиа, сертификаты, лиды, `content_blocks`, настройки, **catalog health**, **product series** в UI.
- **CMS:** ключи и merge в `lib/site-content/*`, публичные resolvers, безопасный fallback на defaults.
- **Медиа:** local / Supabase drivers, публичные URL через `MEDIA_PUBLIC_BASE_URL`.
- **Заявки:** `POST /api/request`, лиды в БД, Telegram.
- **Аналитика:** GA4 bootstrap в root layout (`send_page_view: false`) + опциональный GTM; события через `dataLayer` / `trackEvent`, `PageViewTracker` для App Router.

## Основные production flows

1. Пользователь → публичные страницы → каталог/товар → CTA → `POST /api/request` → БД + Telegram.  
2. Оператор → `/admin/login` → сессия JWT (Edge `proxy.ts`) → правки каталога/CMS → `revalidatePath` / ISR где настроено на страницах каталога.  
3. Деплой: env из `.env.example` → `npm ci` → `npm run build` → миграции при смене схемы (`npm run db:migrate`).

## Technical debt / отложенное

- `lib/admin/safe-return-to.ts` не подключён к реальным query-параметрам (см. `docs/cleanup-candidates.md`).
- Зависимости `@tanstack/react-query` и `shadcn` в `package.json` без использования в коде — кандидаты на удаление после проверки.
- Два файла `admin-public-content-map` (корень vs `docs/`) — свести к одному при ручной сверке таблиц.
- Расширить автотесты/smoke под DB-режим и импорт Excel (сейчас опора на lint/build и ручной QA).

## Валидация после изменений в этом спринте

Выполнять из каталога `mansvalve/`:

```bash
npm run lint
npm run build
```
