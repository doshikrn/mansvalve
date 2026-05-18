# Product Content Contract

Единый контракт текстов и медиа товара между БД, админкой и публичным сайтом. **Источник истины для публичного слоя** — результат `buildPublicProductView()` в `lib/public-catalog/product-view.ts` (внутри него один раз вызывается `buildProductDetailContent()` для тела страницы и canonical).

| Контрактное поле | Источник в БД / модели | Редактируемое или сгенерированное | Где используется публично | Приоритет fallback |
| --- | --- | --- | --- | --- |
| **internalTitle** | `products.name` (`ProductDetail.name`) | Редактируемое (админка, не H1) | Список товаров в админке, хлебные крошки редактирования | — |
| **publicTitle** | `products.public_title` → `PublicCatalogProduct.publicTitle` | Редактируемое | `displayName`, SEO title (часть), поиск, карточки, JSON-LD `name` | 1) `publicTitle` (trim) 2) `formatProductDisplayName(product)` |
| **h1** | `products.h1_override` → `h1Override` | Редактируемое (опционально) | `<h1>` на `/tovar/...` и `/zadvizhki/...` | 1) `h1Override` 2) `publicTitle` 3) `formatProductDisplayName(product)` |
| **shortDescription** | `products.short_description` | Редактируемое | Карточки каталога (`ProductCard`), превью в админке, резолв `buildPublicProductView().shortDescription` | 1) непустой `shortDescription` 2) первый абзац полного описания (`detailContent.descriptionParagraphs[0]`) 3) `""` если нет текста |
| **fullDescription** | `products.long_description` + шаблон серии (gate) | Редактируемое + автоподстановка | Блок «Описание», hero-текст на `/zadvizhki/...` при наличии товара, JSON-LD `description` | 1) абзацы из `longDescription` 2) `introParagraphs` шаблона задвижки 3) `shortDescription` 4) служебная строка по категории (`pickDescriptionParagraphs`) |
| **standards** | `products.detail_blocks.standards` (JSON) | Редактируемое; при пустом массиве — шаблон | Секции списков на `/tovar/...` и `/zadvizhki/...` | 1) нормализованные строки из БД 2) `seoPage.standards` для задвижки |
| **advantages** | `detail_blocks.benefits` | Редактируемое + шаблон | То же | 1) БД 2) `seoPage.benefits` |
| **application** | `detail_blocks.applications` | Редактируемое + шаблон | То же | 1) БД 2) `seoPage.applications` |
| **documentsQuality** | `detail_blocks.quality_documents` | Редактируемое + шаблон | Список на странице; сайдбар «Документация…» на `/zadvizhki/...` | 1) БД 2) `seoPage.qualityDocuments` |
| **deliveryTerms** | `detail_blocks.supply_terms` | Редактируемое + шаблон | Секция «Условия поставки» | 1) БД 2) `seoPage.supplyTerms` |
| **seoTitle** | Нет отдельного поля в БД | **Сгенерировано** (`buildPublicProductView`) | `<title>`, Open Graph | Шаблон: `Купить ${seoName} в Казахстане \| MANSVALVE GROUP`, где `seoName` = `publicTitle` или `formatProductSeoName` |
| **seoDescription** | Нет отдельного поля | **Сгенерировано** | meta description, OG | `buildProductMetaDescription(displayName)` в `lib/catalog-seo.ts` |
| **canonical** | Логика категории + slug | **Сгенерировано** | `<link rel="canonical">`, ссылки, sitemap | 1) путь шаблона задвижки `/zadvizhki/[slug]` 2) `/tovar/[slug]` |
| **primaryImage** | Медиа товара (`images`, primary) или визуал категории | Редактируемое (галерея); картинка категории — fallback | Карточка, страница товара, OG image, поиск (URL) | 1) primary image из БД 2) первое изображение 3) `getCategoryVisual(category).imageSrc` |

## Публичный API

`PublicProductView` дополнительно отражает контракт явными полями:

- `fullDescription` — `detailContent.descriptionParagraphs`, склеенные через `\n\n`.
- `contentSections` — те же массивы, что в `detailContent`, с именами контракта: `advantages` (= `benefits`), `application`, `documentsQuality`, `deliveryTerms`.

## Где не дублировать логику

- Карточка, `/tovar/[slug]`, `/zadvizhki/...`, `GET /api/search/products`, JSON-LD, sitemap — опираются на `buildPublicProductView()` (или на те же данные через него).
- Админский preview (`AdminProductPreview` + блок «SEO preview») не редактирует SEO-тексты повторно: только отображение итогов.

## Ограничения (текущая версия)

- Отдельных полей «SEO title / SEO description override» в БД нет и миграции под них не делаем — SEO строго из builder.
- Slug и URL-структура вне этого документа; slug не меняем в рамках задач контента.
