# Performance & reliability audit

**Scope:** Next.js App Router public site + admin, catalog (JSON/DB), media, import, analytics.  
**Method:** static analysis, build output, hot-path code review (no load-test).  
**Date:** 2026-05-22

---

## Quick fixes applied (this sprint)

| ID      | Change                                                                                                                                    | Files                          |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| PRA-Q01 | Wrapped public catalog read APIs in `React.cache()` so identical calls in the same request (e.g. layout + page) share one adapter round-trip | `lib/public-catalog/index.ts`  |
| PRA-Q02 | `trackEvent`: if GTM is configured, push **only** to `dataLayer`; otherwise use `gtag` — avoids double-counting when GA4 is also wired via GTM | `lib/analytics.ts`             |
| PRA-Q03 | Tuned `next/image` `sizes` on catalog cards for multi-column layouts                                                                      | `components/catalog/ProductCard.tsx` |

**Validation:** `npm run lint` and `npm run build` succeed. There is no `npm test` script in `package.json`.

---

## Critical

_No production-breaking defects identified in this pass._

---

## High

| ID       | Area            | Symptom / risk                                                                                       | Likely cause                                                                                              | Minimal fix                                                                                                      | Risk if changed                          |
| -------- | --------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| PRA-H01 | Catalog / DB    | `/catalog` and shell load **all** products for filtering; cost grows with catalog size                 | Product list is full in-memory filter in `CatalogShell` path                                             | Server-side pagination or facet-backed SQL queries; cache segments with `revalidateTag`                          | Medium — touches UX and URL contract     |
| PRA-H02 | Product pages   | Nested klapany non-series path calls `getPublicCatalogProducts()` for “related” products             | `prepareTovarProductPageData` needs full list for related picker                                          | DB: `getRelatedProducts` query limited by subcategory; or pass precomputed related from caller                 | Low–medium                               |
| PRA-H03 | Root layout     | GA bootstrap script loads on **every** route including `/admin`                                      | `app/layout.tsx` injects GA/GTM globally; trackers no-op on admin but scripts still parse                 | Load GA/GTM only from `(site)` layout or gate with `headers()`/`pathname` segment (careful with RSC boundaries) | Medium — can break analytics if mis-split |

---

## Medium

| ID       | Area              | Symptom                                                                               | Likely cause                                        | Minimal fix                                        | Risk   |
| -------- | ----------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------- | -------------------------------------------------- | ------ |
| PRA-M01 | Rendering         | Each `ProductCard` runs `buildPublicProductView` (CPU on large grids)                   | View built per card                                 | Precompute lightweight DTO in parent or memo view for listing only | Low    |
| PRA-M02 | Analytics         | `page_view` + `product_view` + funnel `catalog_view` — multiple events per navigation   | Intentional funnel; verify GTM container maps once  | Document in GTM; optional dedupe flag in env       | Low    |
| PRA-M03 | Admin tables      | Large DOM on products / import preview / media                                        | Long lists without windowing                        | Virtualize or stricter default page size           | Medium |
| PRA-M04 | ISR vs dynamic    | `/catalog` is `ƒ` dynamic (expected with `searchParams`)                              | Search/filter query string                          | Acceptable; optional `loading.tsx` skeleton          | Low    |
| PRA-M05 | Config            | Default `NEXT_PUBLIC_GA_MEASUREMENT_ID` fallback in code                              | Analytics always “configured” unless overridden     | Require explicit env in production                   | Low–policy |

---

## Low

| ID       | Area        | Symptom / note                                      | Likely cause | Minimal fix                          | Risk |
| -------- | ----------- | --------------------------------------------------- | ------------ | ------------------------------------ | ---- |
| PRA-L01 | DB schema   | Products already have slug unique + category/subcategory indexes | —            | Optional composite `(category_id, is_active)` if EXPLAIN shows seq scans | Low  |
| PRA-L02 | Bundle      | `framer-motion` on public layout via `MotionConfig` | Small import | Keep; already minimal surface       | —    |
| PRA-L03 | Import      | `exceljs` only in `lib/products-import/*`           | —            | None; confirm never imported from client | —    |
| PRA-L04 | Security    | `safeReturnTo` restricts `/admin` paths             | —            | None                                 | —    |

---

## Deferred (risky or large scope)

- Full **catalog query engine** refactor (facets in SQL, cursor pagination, denormalized search table).
- **Splitting root layout** analytics to exclude admin without duplicating HTML shell incorrectly.
- **Virtualization** of admin grids without product/design sign-off.
- **Composite DB indexes** without `EXPLAIN ANALYZE` on production-like data volume.

---

## Manual smoke checklist

After deploy or locally:

- [ ] `/` — header nav, images, no console errors  
- [ ] `/catalog` — filters, cards, images  
- [ ] Product page (canonical URL from card) — JSON-LD, breadcrumbs  
- [ ] `/admin/products` — list loads  
- [ ] `/admin/media` — list + search  
- [ ] `/admin/products/import` — preview + apply  
- [ ] `/admin/catalog-health` — summary loads  

**Analytics:** With GTM + GA4, confirm in DebugView that custom events are not duplicated after PRA-Q02 (GTM-only path when `NEXT_PUBLIC_GTM_ID` is set).

---

## Summary

| Theme              | Main bottlenecks                                      | Status this sprint                          |
| ------------------ | ----------------------------------------------------- | ------------------------------------------- |
| Request deduplication | Duplicate `getPublicCatalogCategories` / `getPublicCatalogProducts` / slug lookups | **Mitigated** with `React.cache`          |
| Analytics          | Dual `dataLayer` + `gtag` pushes                      | **Mitigated** when GTM is configured        |
| Images             | Suboptimal `sizes` on dense grids                    | **Slightly improved** on `ProductCard`      |
| Catalog scale      | Full product hydration on `/catalog`                | Documented; needs larger design pass        |
