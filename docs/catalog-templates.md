# Catalog Templates & Slug Lifecycle

Документ описывает, как стабилизированы slug-жизненный цикл, redirect'ы после
переименования товаров и lightweight-шаблоны товарных серий.

## 1. Slug lifecycle

| Сценарий | Поведение |
| --- | --- |
| Создание товара (`createProductAction`) | Если поле slug пустое — slug генерируется из `slugify(name)`. Если задан вручную — slugify применяется к значению. |
| Обновление товара (`updateProductAction`) | Если поле slug **пустое** — slug **остаётся прежним** (`existingSlug`). Если задано новое значение — применяется `slugify` и старый slug сохраняется как alias (см. §2). Изменение названия товара **никогда** не меняет slug автоматически. |
| Smart slugify | Реализовано в `lib/services/slug.ts`. |

UI:
- `components/admin/ProductForm.tsx` показывает бейдж **URL ЗАФИКСИРОВАН** у поля slug
  при редактировании существующего товара и **AUTO** при создании.
- При ручном изменении slug подсвечивается inline-warning с объяснением, что
  старый URL будет перенаправлять на новый (301 permanent redirect).

## 2. Slug history / safe redirects

Таблица `product_slug_aliases` (`lib/db/migrations/0008_product_slug_aliases.sql`,
`schema.productSlugAliases`):

| Поле | Тип | Назначение |
| --- | --- | --- |
| `product_id` | `int`, FK → `products` (ON DELETE CASCADE) | Текущий товар. |
| `slug` | `varchar(200)` UNIQUE | Исторический slug. |
| `created_at` | `timestamptz` | Когда был зафиксирован alias. |

Алгоритм в `updateProduct` (`lib/services/products.ts`):
1. Считывается текущий slug товара (`previousSlug`).
2. После апдейта, если `previousSlug !== core.slug`, любая запись alias с новым
   slug удаляется (защита от старого alias, который мог бы «закрыть» новый slug),
   затем `previousSlug` вставляется в `product_slug_aliases`.
3. При повторном создании товара с тем же slug (`createProduct`) старый alias
   также вычищается — ручная публикация имеет приоритет над redirect'ом.

Публичный resolver: `lib/public-catalog/slug-aliases.ts` →
`resolveProductSlugAliasTarget(slug)`. Возвращает canonical путь из
`buildPublicProductView` по текущему slug товара.

Подключено к маршрутам:
- `/tovar/[slug]/page.tsx` — `notFound()` сначала пытается резолвить alias и
  делает `permanentRedirect` с переносом query string.
- `/catalog/[slug]/page.tsx` — то же поведение для legacy URL.

Sitemap (`app/sitemap.ts`) использует только `view.canonicalPath` и поэтому
никогда не публикует aliases. Поиск/JSON-LD/canonical всегда используют текущий
slug, так что индексаторы получают только актуальные URL.

## 3. Template series (gate valves)

Шаблоны серий задвижек уже заложены в `lib/seo-product-pages/gate-valves.ts`:

- `GATE_VALVE_SEO_PAGES` — массив сгенерированных SEO-страниц (`/zadvizhki/[slug]`),
  каждая со своим `series`, `model`, `dn`, `pn`, `connectionVariant`.
- Шаблоны (`templates`) переиспользуют общие блоки (`COMMON_STANDARDS`,
  `STEEL_STANDARDS`, `DEFAULT_QUALITY_DOCUMENTS`, `DEFAULT_SUPPLY_TERMS`) — это и
  есть «shared content sections».
- На лету шаблон создаёт `introParagraphs`, `characteristics`, `seoTitle`,
  `seoDescription` от параметров DN/PN.

### Inheritance

`GateValveSeoProductPage` (`components/catalog/GateValveSeoProductPage.tsx`)
строит публичный slot так:
1. Если есть товар из БД — берёт текст из `buildPublicProductView(product)`
   (то есть из `detail_blocks` и/или description полей товара) с fallback на шаблон.
2. Если товара ещё нет — все блоки берутся из шаблона серии.

Таким образом контент гарантированно консистентен между SKU одной серии и
переопределяется только теми полями, что менеджер явно ввёл в админке. Product
Content Contract (`docs/product-content-contract.md`) уже описывает приоритет
fallback для каждого поля.

### Series gap audit (admin)

`/admin/products/series` — read-only страница, которая показывает все
`GATE_VALVE_SEO_PAGES` и их статус: «есть в БД» или «отсутствует». Это позволяет
менеджеру быстро увидеть пробелы и завести недостающие товары вручную через
обычный `/admin/products/new`. Никаких авто-создателей не вводится — это
сохраняет контроль и совместимость со существующим Product Content Contract.

## 4. Routing safety matrix

| Действие | Что меняется | URL | Поведение |
| --- | --- | --- | --- |
| Изменить internalTitle (`name`) | `products.name` | без изменений | Старый URL живой, slug не трогается. |
| Изменить publicTitle | `products.public_title` | без изменений | URL не меняется. |
| Изменить H1 (`h1_override`) | `products.h1_override` | без изменений | URL не меняется. |
| Поменять slug вручную | `products.slug` + alias на старый | `/tovar/{new}` | Старый `/tovar/{old}` → 301 → canonical. |
| Удалить товар | строка удалена, aliases каскадно удаляются | — | Старый URL отдаёт 404 (намеренно). |

## 5. Series inheritance model (явная)

`lib/catalog/series-inheritance.ts` формализует inheritance contract:

```
Series template (lib/seo-product-pages/gate-valves.ts)
  ↓
SKU (products.detail_blocks — nullable, partial overrides)
  ↓
Public view (buildPublicProductView → buildProductDetailContent)
```

Shared блоки: `standards`, `benefits`, `applications`, `qualityDocuments`,
`supplyTerms`. Для каждого SKU `computeSeriesDrift(product, template)` возвращает
состояние по каждому блоку:

| State | Значение |
| --- | --- |
| `inherited` | поле пустое → используется шаблон (template fallback) |
| `match` | значение совпадает с шаблоном |
| `partial` | частичный override (есть общие элементы и есть собственные) |
| `override` | полностью свои значения, нет пересечения с шаблоном |

Это «intentional override vs drift» дифференциация для аудита.

## 6. Safe bulk apply-to-series

`/admin/products/series` → форма «Apply-to-series» (multi-checkbox по блокам) →
кнопка **Превью**. Превью показывает список SKU, у которых выбранные блоки
пустые и будут заполнены значениями шаблона.

Server action `applyMissingSeriesBlocksAction`
(`app/admin/products/series/actions.ts`):

1. Загружает SKU группы серии (по `model`, `pn`, `connectionVariant`).
2. Для каждого вызывает `buildMissingBlockPatch(currentBlocks, templateBlocks, fields)` —
   возвращает patch **только** для пустых полей.
3. `patchProductDetailBlocks(productId, patch)` (`lib/services/products.ts`) делает
   one-shot UPDATE jsonb `detail_blocks` без потери existing значений.
4. Revalidate per-product через `revalidateSingleProductPaths`
   (`lib/catalog/revalidate-products.ts`) + один общий `revalidatePath("/")`,
   `revalidatePath("/catalog")`, `revalidatePath("/sitemap.xml")`.
5. `await settleRevalidation()` перед redirect.

Контракты:
- **Никогда** не перезаписывает существующие значения. Если блок уже заполнен —
  пропускается.
- Идемпотентно: повторный вызов с тем же набором полей не меняет ничего.
- Никаких массовых migrations: операция — обычный SET jsonb через UPDATE.

## 7. Catalog health dashboard

`/admin/catalog-health` + `lib/catalog/health.ts` → `getCatalogHealthReport()`.

Метрики:

| ID | Severity | Что проверяет |
| --- | --- | --- |
| `missing_image` | warn | нет primary image |
| `missing_public_title` | info | `publicTitle` пустой (fallback на автоген) |
| `missing_short_description` | warn | `short_description` пустой |
| `missing_specs_and_blocks` | warn | нет ни одной spec и нет `detail_blocks` |
| `missing_subcategory` | warn | подкатегория не указана |
| `fallback_only_series` | info | в серии, все shared блоки = template fallback |
| `series_drift` | info | override/partial хотя бы по одному shared блоку |
| `duplicate_canonical` | critical | два или более товара имеют одинаковый `view.canonicalPath` |
| `duplicate_seo_title` | warn | одинаковый `view.seoTitle` (lowercased) |
| `orphan_alias` | critical | строка в `product_slug_aliases` без существующего товара |

Performance: один проход по `getPublicCatalogProducts()` + 3 индексированных
COUNT-запроса + один LEFT JOIN на aliases. Никаких N+1. force-dynamic на
admin-странице исключает кеш ISR.

## 8. Что НЕ сделано (out of scope)

- Нет визуального конструктора шаблонов.
- Нет bulk-генератора, который создавал бы недостающие товары автоматически
  (управляемое создание через `/admin/products/new` остаётся единственным
  способом, чтобы не плодить мусор).
- Нет глобальной headless CMS-абстракции.
- Архитектура каталога не переписана: сохранены `buildPublicProductView`,
  Product Content Contract, ISR (`revalidate = 300`) и текущий sitemap.
