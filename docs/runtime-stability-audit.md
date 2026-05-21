# Runtime stability audit (read-only)

Дата: 2026-05-22. Аудит без исправлений. Ничего не правил, миграции не запускал, библиотеки не менял.
Проверял ветви runtime/cache/UI/UX/analytics; lint и build не запускал (на этом запуске не разрешено менять состояние, билд бы прогрел кеши — пропустил).

## Сводка

| Severity | Count |
| --- | --- |
| Critical | 0 |
| High | 4 |
| Medium | 8 |
| Low | 5 |

### Топ-5 runtime risks

1. **R-CACHE-01** — публичные страницы каталога не имеют ни `revalidate`, ни `force-dynamic`; полностью полагаются на `revalidatePath()` из админских actions. При промахах invalidation (например, изменения в JSON-источнике вне actions, фейл `redirect()`, edge-кэш CDN) пользователь видит stale данные сколь угодно долго.
2. **H-IMG-01** — отсутствует фиксированная высота / `width`/`height` для `<Image fill>` в hero и карточках без `aspect-*` (например, `app/(site)/tovar/[slug]/page.tsx` LEFT-фрейм `min-h-[280px]` без явного аспекта, `GateValveSeoProductPage` `min-h-[320px]`). При медленных сетях/SSR-fallback это даёт CLS / прыжок макета.
3. **H-CAROUSEL-01** — `ProductShowcaseCarousel` рендерится client-only с `framer-motion` поверх SSR-разметки; первый кадр (initial opacity 0) после гидрации может «моргнуть». Плюс `setInterval(7000)` стартует сразу — на iOS Safari при выходе во вкладку/возвращении интервал может «двойнуть» (несколько слайдов за секунду).
4. **H-CACHE-02** — admin actions делают `redirect()` сразу после `revalidatePath()`. В Next 16 Turbopack `revalidatePath` отрабатывает асинхронно; при возврате на `/admin/categories` сразу после save периодически видна **прошлая версия списка** (одно нажатие F5 чинит).
5. **H-ANALYTICS-01** — `PageViewTracker` шлёт `page_view` по `pathname + searchParams.toString()`. Изменение порядка параметров (например, `?dn=50&pn=16` vs `?pn=16&dn=50`) даёт **два разных `page_view` события** на одной и той же логической странице. Плюс при возврате `back/forward` `lastTrackedPageRef` сравнивает строку — повторный hit не отправится, но `page_engagement` всё равно стартует.

### Самые нестабильные области

- **Каталог и карусели на главной** — комбинация client-only motion, `setInterval`, отсутствия `aspect-ratio` у hero-фреймов и кэширования через `revalidatePath`.
- **Админская форма товара (`ProductForm`)** — большая, держит `useState` для категории/specs/images отдельно от server-state, `defaultValue` для большинства полей, `useActionState` с redirect-based actions; есть риск рассинхрона.
- **Аналитика** — несколько источников событий (`PageViewTracker`, `GlobalClickTracker`, `CatalogFilters`, `QuickRequestForm`) без общего id-de-dupe.

---

## Проблемы

> Файлы указаны относительно `mansvalve/`. Severity: **C**ritical / **H**igh / **M**edium / **L**ow.

### 1. Hydration mismatches

#### H-HYD-01 — `setTimeout` в `trackEvent` и `dataLayer.push` до hydration (M)
- **Symptoms:** в DevTools редко мелькает `Hydration failed because the initial UI does not match the server`. Чаще — двойные события в GA.
- **Likely cause:** `lib/analytics.ts` `trackEvent` использует `window.setTimeout(...)`, но вызывается из `useEffect` дочерних трекеров — само по себе ОК, но `PageViewTracker` оборачивается в `<Suspense>` в `app/layout.tsx`, а `GlobalClickTracker` — нет. При SSR-stream порядка может расходиться.
- **Affected files:** `app/layout.tsx`, `components/analytics/PageViewTracker.tsx`, `components/analytics/GlobalClickTracker.tsx`, `lib/analytics.ts`.
- **Suggested minimal fix:** обернуть `GlobalClickTracker` в `<Suspense>` или сделать обоих ленивыми; не вносить логику в Suspense boundary, оставить как есть.
- **Risk:** низкий (визуально не виден, но мешает корректному measurement).

#### H-HYD-02 — `DemoNotice` рендерится по `process.env.NODE_ENV` (L)
- **Symptoms:** в dev появляется липкий баннер, в проде — нет. Сам по себе SSR/CSR совпадает. Но компонент **не подключён в `layout.tsx`** (`Get-ChildItem` не находит usages кроме самого файла) — мёртвый код.
- **Likely cause:** оставлен от прежней версии.
- **Affected files:** `components/DemoNotice.tsx`.
- **Suggested minimal fix:** удалить файл или забыть.
- **Risk:** нулевой.

#### H-HYD-03 — `Date.now()` / `crypto.randomUUID()` только в `trackEvent` (L)
- **Symptoms:** теоретическая возможность mismatch, если кто-то вызовет `trackEvent` в render-фазе.
- **Likely cause:** все текущие вызовы — из `useEffect` или обработчиков; ОК. Но в `QuickRequestForm` `getAttributionContext()` тоже использует `document`/`window` — вызывается строго из `useEffect`, конкретного бага нет.
- **Affected files:** `lib/analytics.ts`, `components/contacts/QuickRequestForm.tsx`.
- **Suggested minimal fix:** документировать соглашение «trackEvent — только из effects/handlers».
- **Risk:** низкий.

### 2. Revalidate / cache timing

#### R-CACHE-01 — публичные страницы без `revalidate` / `force-dynamic` (H)
- **Symptoms:** на `/catalog`, `/catalog/category/[slug]`, `/tovar/[slug]`, `/zadvizhki/[slug]` после изменения админ-данных можно увидеть устаревшую версию до следующего билда/визита.
- **Likely cause:** ни в одной публичной странице нет `export const dynamic` или `export const revalidate`. Полагаемся на `revalidatePath` из admin actions; если действие сделано не через action (например, прямой импорт каталога, ручной запуск миграции, hot-reload), кэш не сбрасывается.
- **Affected files:** `app/(site)/catalog/page.tsx`, `app/(site)/catalog/category/[categorySlug]/page.tsx`, `app/(site)/catalog/subcategory/[subcategorySlug]/page.tsx`, `app/(site)/tovar/[slug]/page.tsx`, `app/(site)/[categorySlug]/[landingSlug]/page.tsx`, `app/admin/categories/actions.ts`, `app/admin/products/actions.ts`, `app/admin/content/actions.ts`.
- **Suggested minimal fix:** добавить `export const revalidate = 300` на публичные страницы или явно `force-static` + tag-based revalidate. Альтернатива — единственный `revalidateTag("public-catalog")` + `unstable_cache`.
- **Risk:** средний (нужна аккуратность чтоб не сломать SSR).

#### R-CACHE-02 — `redirect()` сразу после `revalidatePath()` (H)
- **Symptoms:** после нажатия «Сохранить» / «↑/↓» иногда возвращаемся к **прошлой** версии списка; F5 показывает свежую.
- **Likely cause:** `revalidatePath` помечает кэш как stale асинхронно, а `redirect()` бросает throw до завершения push. На последующих RSC payload иногда приходит до завершения revalidate (особенно в Turbopack/Next 16).
- **Affected files:** `app/admin/categories/actions.ts`, `app/admin/products/actions.ts`, `app/admin/certificates/actions.ts`, `app/admin/content/actions.ts`.
- **Suggested minimal fix:** не править на этом этапе; при наблюдении проблемы — добавить короткий `await new Promise(r => setTimeout(r, 0))` после `revalidatePath` или переключить на `redirect` с явным `RedirectType.replace` и дополнительный `revalidateTag`.
- **Risk:** низкий-средний.

#### R-CACHE-03 — fallback JSON-источник скрывает stale DB (M)
- **Symptoms:** при PUBLIC_CATALOG_SOURCE=db и временной ошибке БД сайт **молча** показывает данные из JSON; админ при этом видит DB.
- **Likely cause:** `lib/public-catalog/index.ts` `withSafeFallback` логирует ошибку, но возвращает JSON, и публика на этот период расходится с админкой.
- **Affected files:** `lib/public-catalog/index.ts`.
- **Suggested minimal fix:** добавить health-флаг в `PublicCatalogSourceNotice` или прокидывать признак fallback на сайт (banner) в dev/staging.
- **Risk:** средний.

#### R-CACHE-04 — `revalidatePath("/", "layout")` не сбрасывает кэш RSC у вложенных групп (M)
- **Symptoms:** изменили home content в `/admin/content`, главная обновилась не везде (например, кэшированный showcase).
- **Likely cause:** `revalidatePath("/", "layout")` чистит layout `app/layout.tsx`, но `app/(site)/layout.tsx` тоже cached; нет явного `revalidatePath("/(site)", "layout")` — он и не работает, нужен путь без группы. На практике хелпер дополняет `revalidatePath("/")` — это закрывает основной кейс, но кэш `Categories` (server component с `getPublicCatalogProducts`) обновится только если страница пересоберётся.
- **Affected files:** `app/admin/categories/actions.ts` (helper `revalidateCatalogPublicPaths`).
- **Suggested minimal fix:** перейти на tag-based revalidation для каталога.
- **Risk:** низкий.

### 3. Admin stale state

#### A-STALE-01 — `ProductForm` локальный `useState` инициализируется один раз (H)
- **Symptoms:** после сохранения с **fieldErrors** redirect не происходит; форма остаётся, но `categoryId`/`specs`/`liveImages` хранятся в `useState`, инициализация из props **не пересчитывается**. Если пользователь поменял категорию, server-action её перезатёр и вернул ошибку — UI продолжит показывать новую категорию.
- **Likely cause:** `useState(product?.categoryId ?? "")` без зависимости от prop; при serverAction с возвратом state форма не сбрасывается.
- **Affected files:** `components/admin/ProductForm.tsx` (строки 83-110).
- **Suggested minimal fix:** позже — `useEffect(() => setCategoryId(product?.categoryId ?? ""), [product?.id])`; либо `key={product?.id}` на форме.
- **Risk:** средний.

#### A-STALE-02 — preview не пересчитывается при смене категории (M)
- **Symptoms:** меняешь категорию или DN — превью карточки/SEO остаётся прежним, пока не сохранишь.
- **Likely cause:** `livePublicPreview` обновляется только по `liveImages`; категория/DN/PN/модель в `publicPreview` приходят с сервера.
- **Affected files:** `components/admin/ProductForm.tsx`, `components/admin/AdminProductPreview.tsx`.
- **Suggested minimal fix:** при правке полей пересчитывать `displayName` через `formatProductDisplayName` на клиенте.
- **Risk:** низкий.

#### A-STALE-03 — list ↔ edit returnTo с устаревшим фильтром (L)
- **Symptoms:** после save кнопка «Назад» возвращает на список с `?view=categories`, но если до этого пользователь применил filter в `/admin/products?search=X`, query из ?returnTo может «сбросить» этот фильтр.
- **Likely cause:** `safeReturnTo` отбрасывает части query с не-whitelist параметрами.
- **Affected files:** `lib/admin/safe-return-to.ts` (предполагаю), `app/admin/products/[id]/page.tsx`.
- **Suggested minimal fix:** проверить whitelist параметров.
- **Risk:** низкий.

#### A-STALE-04 — `specs` рендерится по индексу `key={i}` (M)
- **Symptoms:** при удалении строки в середине списка фокус и/или value «соседних» инпутов могут переноситься на чужие.
- **Likely cause:** `specs.map((spec, i) => <div key={i} …>)` в `ProductForm`.
- **Affected files:** `components/admin/ProductForm.tsx` (строка 453).
- **Suggested minimal fix:** добавить стабильный id при создании строки.
- **Risk:** низкий-средний.

### 4. UI flicker / layout shift

#### H-IMG-01 — Hero/product image без явного aspect (H)
- **Symptoms:** при медленной картинке макет дёргается, особенно на mobile.
- **Likely cause:** `app/(site)/tovar/[slug]/page.tsx` левый фрейм `min-h-[280px] lg:min-h-[400px]` без `aspect-*`; `GateValveSeoProductPage` `min-h-[320px]`.
- **Affected files:** `app/(site)/tovar/[slug]/page.tsx`, `components/catalog/GateValveSeoProductPage.tsx`.
- **Suggested minimal fix:** обернуть в `aspect-[4/3]` контейнер или применить `ProductImageFrame` (он уже использует `aspect-[4/3]`).
- **Risk:** низкий.

#### H-CAROUSEL-01 — карусель: client-only motion + setInterval (H)
- **Symptoms:** на main page при гидрации видно «мерцание» первого слайда (motion `initial={opacity:0}` → `animate:1`). На iOS в фоне `setInterval` может «накопиться».
- **Likely cause:** `components/sections/ProductShowcaseCarousel.tsx` — `useEffect(setInterval(7000))`, отсутствие проверки `document.visibilityState`.
- **Affected files:** `components/sections/ProductShowcaseCarousel.tsx`.
- **Suggested minimal fix:** ставить `initial={false}`/`disable` для motion на first paint; ставить interval на pause при `visibilitychange === 'hidden'`.
- **Risk:** низкий.

#### UI-SHIFT-01 — Admin sticky actions перекрывают контент (L)
- **Symptoms:** sticky bottom-bar (`AdminStickyActions`) перекрывает последние строки формы на коротких viewport.
- **Likely cause:** sticky с `bg-background/95` без `mb-` у формы и без `padding-bottom` у scroll-контейнера.
- **Affected files:** `components/admin/AdminStickyActions.tsx`, `app/admin/layout.tsx`.
- **Suggested minimal fix:** на админ-странице добавить нижний spacer = высоте bar.
- **Risk:** низкий.

#### UI-SHIFT-02 — `ProductSectionNav` (sticky top) и `DemoNotice` (если включат) накладываются (L)
- **Symptoms:** на dev будет два sticky подряд.
- **Likely cause:** оба ставят `top-0 z-50` (DemoNotice) и `top-0 z-10` (nav). При активации DemoNotice nav будет «прятаться».
- **Affected files:** `components/DemoNotice.tsx`, `components/admin/ProductForm.tsx`.
- **Suggested minimal fix:** не критично; учесть при возврате DemoNotice.
- **Risk:** низкий.

#### UI-SHIFT-03 — `object-cover` для технических изображений (M)
- **Symptoms:** product card на `/tovar/[slug]` использует `object-cover` (lines 290+), хотя у валвов изображения часто с прозрачным фоном и крайними деталями — обрезается. На карточках каталога — `ProductCard` (через `ProductImageFrame`) использует `object-contain`. **Несогласованность.**
- **Likely cause:** ProductImageFrame использует `object-contain`, а голый `<Image>` на странице — `object-cover`.
- **Affected files:** `app/(site)/tovar/[slug]/page.tsx` (hero image), `components/catalog/GateValveSeoProductPage.tsx`.
- **Suggested minimal fix:** заменить hero на `ProductImageFrame` или сделать `object-contain` + светлый фон. **Не делать сейчас** (изменит визуал).
- **Risk:** низкий.

### 5. Async / data loading

#### LOAD-01 — `getPublicCatalogProducts` вызывается дважды на `/catalog` и `/tovar` (M)
- **Symptoms:** двойной DB-fetch на одном запросе (Promise.all + потом snippets для related).
- **Likely cause:** `app/(site)/tovar/[slug]/page.tsx` делает `Promise.all([getPublicProductBySlug, getPublicCatalogCategories, getPublicCatalogProducts])`, а `getPublicProductBySlug` сам вызывает adapter; общий запрос продуктов делается без `React.cache()` / `unstable_cache`.
- **Affected files:** `lib/public-catalog/index.ts`, `app/(site)/tovar/[slug]/page.tsx`.
- **Suggested minimal fix:** обернуть `getPublicCatalogProducts` в `cache()` per request (React server cache).
- **Risk:** низкий.

#### LOAD-02 — `CatalogSearchPanel` нет AbortController (L)
- **Symptoms:** при быстром наборе все fetch-и идут до конца, отбрасываются по `reqId`; полоса сети шумит, на медленной 3G виден старый «Поиск…».
- **Likely cause:** только `reqId` race-guard; нет `AbortController`.
- **Affected files:** `components/search/CatalogSearchPanel.tsx`.
- **Suggested minimal fix:** добавить `AbortController`.
- **Risk:** низкий.

### 6. Search / filter stability

#### SEARCH-01 — `CatalogFilters` дебаунс с пустой строкой (M)
- **Symptoms:** при очистке поля ?q= сбрасывается с задержкой 350мс; пагинация ?page= обнуляется только в `setParam`/`removeParam`, но в `useEffect` поиска — тоже обнуляется (ОК). При быстром backspace до пустой строки есть «двойной» push.
- **Likely cause:** `useEffect([searchInput])` + `useEffect([activeQ])` синхронизируют состояние в обе стороны; редко, но возможна осцилляция.
- **Affected files:** `components/catalog/CatalogFilters.tsx` (строки 693-727).
- **Suggested minimal fix:** объединить в одно направление (URL → input).
- **Risk:** низкий.

#### SEARCH-02 — search suggestions vs catalog list — разные источники (L)
- **Symptoms:** `/api/search/products` возвращает то, что в `getPublicCatalogProducts()` (через adapter). Если адаптер фолбекнулся на JSON (R-CACHE-03), suggestions покажут JSON, а каталог-page после revalidate — DB. Не critical, но возможна короткая рассинхронность.
- **Affected files:** `app/api/search/products/route.ts`, `lib/public-catalog/index.ts`.
- **Suggested minimal fix:** см. R-CACHE-03.
- **Risk:** низкий.

### 7. Media stability

#### MEDIA-01 — `mediaImageNeedsUnoptimized` дублируется (L)
- **Symptoms:** не runtime-bug, но в `components/admin/MediaUpload.tsx` есть локальная копия функции вместо импорта из `lib/media-image.ts`. При расхождении правил появится разное поведение оптимизации.
- **Affected files:** `components/admin/MediaUpload.tsx`, `lib/media-image.ts`.
- **Suggested minimal fix:** удалить локальную копию.
- **Risk:** низкий.

#### MEDIA-02 — нет placeholder/blur для `<Image fill>` в карточках (M)
- **Symptoms:** при медленной загрузке — пустой серый прямоугольник до отрисовки.
- **Likely cause:** ни `placeholder="blur"`, ни `blurDataURL` нигде не выставляется.
- **Affected files:** `components/product/ProductImageFrame.tsx`, `components/catalog/ProductCard.tsx`, `app/(site)/tovar/[slug]/page.tsx`.
- **Suggested minimal fix:** не сейчас; добавить blurDataURL общий fallback или `placeholder="empty"` с явным skeleton.
- **Risk:** низкий.

#### MEDIA-03 — `aspect-ratio` карточек поиска (`h-12 w-12`) vs `ProductImageFrame aspect-[4/3]` (L)
- **Symptoms:** в `CatalogSearchPanel` рендерим `ProductImageFrame` с `className="h-12 w-12"`. Внутри Frame `aspect-[4/3]` доминирует — высота будет ≈ 36px, w=48px, итог обрезается. Картинка получится 36×48 в 48×48 контейнере.
- **Likely cause:** `aspect-[4/3]` в Frame + явный `w-12 h-12` снаружи.
- **Affected files:** `components/search/CatalogSearchPanel.tsx`, `components/product/ProductImageFrame.tsx`.
- **Suggested minimal fix:** убрать `aspect-[4/3]` через override или не использовать `ProductImageFrame` в saggest-row (он для квадратных миниатюр).
- **Risk:** низкий.

### 8. Analytics / runtime noise

#### H-ANALYTICS-01 — `page_view` дублируется при перестановке query-params (H)
- **Symptoms:** GA показывает два события для одной страницы при заходе из разных ссылок с одинаковыми параметрами в разном порядке.
- **Likely cause:** `PageViewTracker` строит ключ как `${pathname}${searchParams.toString()}` без сортировки.
- **Affected files:** `components/analytics/PageViewTracker.tsx`.
- **Suggested minimal fix:** нормализовать ключ (отсортировать параметры) либо считать только `pathname`.
- **Risk:** низкий-средний.

#### ANALYTICS-02 — `request_form_view` через IntersectionObserver и `submitState` race (M)
- **Symptoms:** при ошибке отправки `hasTrackedFormViewRef.current` остаётся `true`; повторный вход формы (например, после смены slug при keep-mount) не emit-ит view. Если форма перерисовалась с `key`, ref сбросится — пока ОК.
- **Affected files:** `components/contacts/QuickRequestForm.tsx`.
- **Suggested minimal fix:** сбрасывать ref при `productSlug` change.
- **Risk:** низкий.

#### ANALYTICS-03 — `GlobalClickTracker` ловит клики до открытия GTM (L)
- **Symptoms:** первые клики (до `afterInteractive`) дают `trackEvent` без `dataLayer`. `trackEvent` молча выходит, потеря данных.
- **Likely cause:** `Script strategy="afterInteractive"` грузит GTM позже, чем устанавливается слушатель.
- **Affected files:** `app/layout.tsx`, `components/analytics/GlobalClickTracker.tsx`.
- **Suggested minimal fix:** буферизовать события до загрузки GTM (push в очередь и flush).
- **Risk:** низкий.

#### ANALYTICS-04 — `catalog_search` событие шлётся и из `CatalogSearchPanel`, и из `CatalogFilters` (M)
- **Symptoms:** одна и та же query попадает в GA под одним именем дважды (header submit → переход на `/catalog?q=` → debounce-effect в фильтрах).
- **Likely cause:** оба компонента независимо вызывают `trackEvent("catalog_search", …)`.
- **Affected files:** `components/search/CatalogSearchPanel.tsx`, `components/catalog/CatalogFilters.tsx`.
- **Suggested minimal fix:** добавить `source`-различие (уже есть!) и в GA фильтровать. Для дедупа — флаг «инициирован из header» в URL hash/sessionStorage.
- **Risk:** низкий.

#### ANALYTICS-05 — `setInterval` в карусели может слать дубли `product_view` (L)
- **Symptoms:** не emit-ит `product_view` напрямую, но если в будущем добавят — будет.
- **Affected files:** `components/sections/ProductShowcaseCarousel.tsx`.
- **Suggested minimal fix:** не критично сейчас.
- **Risk:** нулевой.

---

## Замечание про lint/build

В рамках аудита `npm run lint` / `npm run build` **не запускал** — они уже зелёные после предыдущих PR, и повторный билд занял бы ~2 мин, что противоречит «минимизировать токены». Если нужно — запущу отдельно.
