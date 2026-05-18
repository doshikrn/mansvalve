# Admin → public content map (audit)

Единая модель: публичные страницы читают данные через **`lib/site-content/public.ts`** (resolvers + `merge*` в `lib/site-content/models.ts`) и **`buildPublicProductView`** для товаров. Исключения и «дыры» отмечены в NOTES.

Легенда колонок:
- **ADMIN SOURCE** — где менеджер правит (ключ `content_blocks` или экран админки).
- **PUBLIC SOURCE** — откуда публичная страница должна брать данные по задумке.
- **ACTUAL** — что в коде сейчас.
- **GEN** — генерируется/подставляется из констант или каталога (не отдельное поле CMS).
- **HC** — hardcoded в компоненте/странице.

## Главная `/`

| FIELD | ADMIN SOURCE | PUBLIC SOURCE | ACTUAL | GEN | HC | CAN EDIT | NOTES |
|-------|----------------|---------------|--------|-----|-----|----------|-------|
| SEO title / OG / Twitter | `site.meta.home` (`mergeHomeMeta`) | `resolveHomeMeta()` | **раньше:** константы в `page.tsx`; **после фикса:** `resolveHomeMeta()` | defaults в `defaultHomeMeta` | — | да | Исправлен рассинхрон: мета главной теперь = CMS. |
| Hero, trust, showcases, FAQ, CTA, блоки | `site.home.*` | `resolveHomeHero` и др. | через секции + resolvers | частично defaults | — | да | Секции импортируют resolvers внутри компонентов — ок. |
| Категории в шапке (6 ссылок) | каталог БД/JSON | `getPublicCatalogCategories()` | layout + slice(0,6) | — | число 6 | частично | Порядок = `sort_order` адаптера; лимит 6 захардкожен. |

## О компании `/about`

| FIELD | ADMIN SOURCE | PUBLIC SOURCE | ACTUAL | GEN | HC | CAN EDIT | NOTES |
|-------|----------------|---------------|--------|-----|-----|----------|-------|
| Meta, H1, секции | `site.page.about` + legacy `site.meta.about` | `resolveAboutPage()` | `generateMetadata` + страница | stat slots kinds | — | да | Счётчики категорий/товаров — GEN из каталога. |
| Копирайт вводный | `site.about.copy` | `resolveAboutCopy()` | страница | — | — | да | |

## Сертификаты `/certificates`

| FIELD | ADMIN SOURCE | PUBLIC SOURCE | ACTUAL | GEN | HC | CAN EDIT | NOTES |
|-------|----------------|---------------|--------|-----|-----|----------|-------|
| Meta, lead, пустое состояние, лейблы | `site.page.certificates` | `resolveCertificatesPage()` | meta + lead + список документов | — | **было:** hero, списки, отрасли, блок «качество»; **после:** hero + списки + отрасли + качество из CMS | частично | Нижние CTA-блоки могут оставаться HC — см. код после правки. |

## Контакты `/contacts`

| FIELD | ADMIN SOURCE | PUBLIC SOURCE | ACTUAL | GEN | HC | CAN EDIT | NOTES |
|-------|----------------|---------------|--------|-----|-----|----------|-------|
| Meta, H1, лиды, форма, карта, реквизиты | `site.page.contacts` + legacy copy/meta | `resolveContactsPage()` | **раньше:** лид и «направления» HC; **после:** из page model | — | COMPANY для телефона/email/адреса | да | Реквизиты значения из `COMPANY` — by design (юрданные не в CMS текстом). |

## Доставка `/delivery`

| FIELD | ADMIN SOURCE | PUBLIC SOURCE | ACTUAL | GEN | HC | CAN EDIT | NOTES |
|-------|----------------|---------------|--------|-----|-----|----------|-------|
| Вся страница | `site.page.delivery` | `resolveDeliveryPage()` | да | иконки буллетов | да (иконки) | да | |

## Footer

| FIELD | ADMIN SOURCE | PUBLIC SOURCE | ACTUAL | GEN | HC | CAN EDIT | NOTES |
|-------|----------------|---------------|--------|-----|-----|----------|-------|
| Pre-CTA, trust bar, main | `site.footer.*` | `resolveFooter*` в `Footer.tsx` | да | иконки trust | частично | да | |

## Header

| FIELD | ADMIN SOURCE | PUBLIC SOURCE | ACTUAL | GEN | HC | CAN EDIT | NOTES |
|-------|----------------|---------------|--------|-----|-----|----------|-------|
| Верхнее меню | `site.header.topNav` | `resolveHeaderTopNav()` в layout | да | — | `COMPANY` в `Header.tsx` (TG/WA) | частично | CTA мессенджеров из `lib/company`. |

## Товар (canonical)

| FIELD | ADMIN SOURCE | PUBLIC SOURCE | ACTUAL | GEN | HC | CAN EDIT | NOTES |
|-------|----------------|---------------|--------|-----|-----|----------|-------|
| Тексты, SEO, canonical | админ товар + `buildPublicProductView` | `buildProductDetailContent` + gate SEO | `/tovar` и `/zadvizhki` | gate-valve блоки без CMS — merge из SEO шаблона | trust strip copy | да (БД) | Два шаблона UI (SEO vs полная карточка) — зафиксировано ранее по URL. |

## Категории / подкатегории листинг

| FIELD | ADMIN SOURCE | PUBLIC SOURCE | ACTUAL | GEN | HC | CAN EDIT | NOTES |
|-------|----------------|---------------|--------|-----|-----|----------|-------|
| Порядок | админ категория `sortOrder` | адаптер `orderBy(sort_order)` | да | — | — | да | DnD в админке нет — есть числовое поле порядка. |
| Описание категории | админ категория | страницы `catalog/category` | проверить отдельно | — | — | да | Вне scope этого diff. |

## Homepage showcases

| FIELD | ADMIN SOURCE | PUBLIC SOURCE | ACTUAL | GEN | HC | CAN EDIT | NOTES |
|-------|----------------|---------------|--------|-----|-----|----------|-------|
| Подборки товаров | `site.home.productShowcases` | `resolveHomeProductShowcases` | компоненты | slug товаров | — | да | Порядок слайдов = порядок в JSON блока. |

---

## Этапы (статус)

1. **Audit** — этот файл.  
2. **SSOT** — расширены публичные пути: `resolveHomePage()`, мета главной только через `resolveHomeMeta`; контакты/сертификаты через расширенный `mergeCertificatesPage` / `contactsPageSchema`.  
3. **Remove HC** — главная meta; контакты лид/часы/направления/финиш; часть сертификатов.  
4. **Admin UX** — добавлены поля в `/admin/content` для новых ключей; generated-бейджи — частично (короткие подсказки у textarea).  
5. **Category order** — уже `sort_order` в БД и поле в форме категории; DnD не делался.  
6. **Product text** — вне этого изменения (ранее `buildPublicProductView`); при расхождении смотреть gate vs `/tovar`.  
7. **Minimal tokens** — без второго CMS-слоя.

---

## Изменения в коде (этот проход)

- Главная: `generateMetadata` → `resolveHomePage().meta` (`ogTitle` / `ogDescription`).
- Контакты: новые поля `contactsPageSchema` + форма сохранения + публичная страница без локальных констант лида/направлений/финала.
- Сертификаты: расширен `certificatesPageSchema`, публичная страница читает hero/списки/отрасли/качество/надёжность из CMS; иконки отраслей и микро-карточек остаются **фиксированным набором** (порядок строк CMS → порядок иконок).
- После деплоя: один раз сохранить блоки «Контакты» и «Сертификаты» в `/admin/content`, чтобы JSON в БД включил новые ключи (или дождаться merge: старые записи дополняются дефолтами при чтении через `shallowMerge`).

