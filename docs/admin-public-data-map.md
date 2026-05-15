# Admin/Public Data Map

This note is the audit checklist for keeping admin-managed content aligned with
the public site.

## CMS pages

| Public route | Public resolver | Content key | Admin section | Revalidated paths |
| --- | --- | --- | --- | --- |
| `/` | `resolveHomeHero`, `resolveTrustStrip`, `resolveRequestCta`, `resolveHomeFaq`, `resolveHomeMeta`, home section resolvers | `site.home.*`, `site.meta.home` | Home | `/`, `/admin/content`, `/sitemap.xml` when metadata changes |
| `/about` | `resolveAboutPage`, `resolveAboutCopy` | `site.page.about`, legacy `site.about.copy`, `site.meta.about` | About and `/about - site.page.about` | `/about`, `/admin/content`, `/sitemap.xml` |
| `/contacts` | `resolveContactsPage`, legacy contacts copy/meta | `site.page.contacts`, `site.contacts.copy`, `site.meta.contacts` | Contacts and `/contacts - site.page.contacts` | `/contacts`, `/admin/content`, `/sitemap.xml` when metadata changes |
| `/delivery` | `resolveDeliveryPage` | `site.page.delivery` | `/delivery - site.page.delivery` | `/delivery`, `/admin/content`, `/sitemap.xml` |
| `/certificates` | `resolveCertificatesPage` plus certificate records | `site.page.certificates`, `certificates` | `/certificates - site.page.certificates`, certificates admin | `/certificates`, `/admin/content`, `/sitemap.xml` |
| Footer/header | `resolveHeaderTopNav`, `resolveFooterMain`, `resolveFooterPreCta`, `resolveFooterTrustBar` | `site.header.topNav`, `site.footer.*` | Header, Footer | `/` layout via `revalidatePath("/", "layout")` |

Notes:
- `/about` still supports legacy `site.about.copy` and `site.meta.about`; public rendering intentionally merges them into `site.page.about` so old data is not lost.
- The About hero image is controlled by `site.page.about.headerImageSrc/headerImageAlt` and edited with `MediaUrlField`.
- If a public section has no content key in this table, it is intentionally static or should be added here before exposing it in admin.

## Product data

| Public surface | Source |
| --- | --- |
| Admin product form/list | `products`, `product_specs`, `product_images`, `media_assets` |
| Public catalog DB mode | `lib/public-catalog/db-adapter.ts` |
| Public catalog JSON fallback | `data/catalog-products.json` via `lib/public-catalog/json-adapter.ts` |
| Public product name, SEO title, image fallback, canonical | `buildPublicProductView(product)` |
| Description/spec blocks | `buildProductDetailContent(product)` through `buildPublicProductView(product)` |
| Product cards | `buildPublicProductView(product)` |
| Search API suggestions | `buildPublicProductView(product)` |
| JSON-LD product | `buildPublicProductView(product)` |

Rules:
- Do not change product slugs when changing names.
- Admin raw `products.name` is an internal/base title; public title is generated from product type, material, construction, connection/feature, model, DN and PN.
- Product detail list blocks use `products.detail_blocks`; generated SEO blocks are only fallback.
- Public catalog edits are visible only when `PUBLIC_CATALOG_SOURCE=db` and `DATABASE_URL` is configured.
