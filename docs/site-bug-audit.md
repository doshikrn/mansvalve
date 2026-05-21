# Site Bug Audit

Date: 2026-05-22  
Mode: read-only audit, no fixes applied.

## Summary

Found issues:

- Critical: 3
- High: 9
- Medium: 8
- Low: 4

This audit focuses on admin-to-public consistency, cache/revalidation, product pages, CMS pages, SEO/analytics, and UI stability after recent changes.

## Critical

### C-01

- Severity: Critical
- Location: Public catalog source switching
- Symptoms: Admin changes can save successfully but public pages still show old JSON data.
- Likely cause: `PUBLIC_CATALOG_SOURCE=db` still falls back to JSON on DB adapter errors.
- Files to inspect/fix: `lib/public-catalog/index.ts`, `lib/public-catalog/db-adapter.ts`
- Suggested fix: In explicit DB mode, surface DB adapter failures loudly in admin/health logs instead of silently using JSON for production pages.
- Estimated risk: high

### C-02

- Severity: Critical
- Location: Admin media library and media usage counts
- Symptoms: `/admin/media` can crash with `column certificates.document_media_id does not exist`.
- Likely cause: `lib/services/media.ts` references `certificates.documentMediaId` directly, while certificate service has a compatibility guard for the same column.
- Files to inspect/fix: `lib/services/media.ts`, `lib/services/certificates.ts`
- Suggested fix: Reuse the certificate document-column compatibility check in media services before querying `document_media_id`.
- Estimated risk: medium

### C-03

- Severity: Critical
- Location: Gate valve SEO product pages
- Symptoms: Product UI can show public builder data, while JSON-LD still contains old static SEO template data.
- Likely cause: `/zadvizhki/[slug]` product JSON-LD is partially built from static gate-valve page config instead of the unified public product view.
- Files to inspect/fix: `components/catalog/GateValveSeoProductPage.tsx`, `lib/public-catalog/product-view.ts`
- Suggested fix: Build JSON-LD name, description, image, characteristics, and offers from `buildPublicProductView()`.
- Estimated risk: high

## High

### H-01

- Severity: High
- Location: Product detail characteristics
- Symptoms: Public characteristics can differ from generated/SEO characteristics when admin specs exist.
- Likely cause: `buildProductDetailContent()` uses product specs first and stops using generated core characteristics.
- Files to inspect/fix: `lib/product-detail-content.ts`, `components/admin/ProductForm.tsx`
- Suggested fix: Merge generated core fields like DN, PN, model, material, and connection with admin specs, with admin values taking priority.
- Estimated risk: medium

### H-02

- Severity: High
- Location: Admin product edit content fields
- Symptoms: Generated SEO blocks look like manual editable content and may become persisted as manual product text after save.
- Likely cause: Admin edit page seeds generated SEO fallback blocks into form initial values when `detailBlocks` is empty.
- Files to inspect/fix: `app/admin/products/[id]/page.tsx`, `components/admin/ProductForm.tsx`
- Suggested fix: Keep generated fallback as preview only; require an explicit "copy fallback into manual fields" action if needed.
- Estimated risk: medium

### H-03

- Severity: High
- Location: Product save and landing pages
- Symptoms: Product pages update, but related SEO landing pages can remain stale.
- Likely cause: Revalidation focuses on canonical product pages, catalog, and sitemap, but static landing pages like `/zadvizhki/30s41nzh` may not be revalidated after product changes.
- Files to inspect/fix: `app/admin/products/actions.ts`, `lib/catalog-seo.ts`, `app/(site)/[categorySlug]/[landingSlug]/page.tsx`
- Suggested fix: Revalidate related landing pages by category/model when product content, images, or status changes.
- Estimated risk: medium

### H-04

- Severity: High
- Location: About page CMS source
- Symptoms: Admin text for "О компании" can differ from what is visible on `/about`.
- Likely cause: Public about page combines legacy `aboutCopy` with newer `pageAbout` content keys.
- Files to inspect/fix: `app/(site)/about/page.tsx`, `lib/site-content/public.ts`, `app/admin/content/actions.ts`
- Suggested fix: Make the admin UI clearly show which fields belong to which public section, or consolidate about page fields into one public resolver.
- Estimated risk: medium

### H-05

- Severity: High
- Location: CMS and category public resolvers
- Symptoms: Admin save succeeds, but public site silently falls back to defaults if DB/content read fails.
- Likely cause: Public resolvers catch errors and return fallback content without visible diagnostics.
- Files to inspect/fix: `lib/site-content/public.ts`, `lib/services/category-public-content.ts`
- Suggested fix: Add structured server logging and an admin diagnostics notice for failed content/category reads.
- Estimated risk: low

### H-06

- Severity: High
- Location: Subcategory public page
- Symptoms: Admin SEO description can affect metadata but not visible page description or JSON-LD.
- Likely cause: Subcategory page renders generated `buildSubcategoryDescription()` while metadata can use DB SEO fields.
- Files to inspect/fix: `app/(site)/catalog/subcategory/[subcategorySlug]/page.tsx`, `lib/services/category-public-content.ts`
- Suggested fix: Use one resolved subcategory description for visible page copy, metadata, and JSON-LD.
- Estimated risk: low

### H-07

- Severity: High
- Location: Sitemap and static product SEO pages
- Symptoms: Sitemap can include static gate-valve SEO URLs even if no active DB product exists.
- Likely cause: `app/sitemap.ts` includes all `GATE_VALVE_SEO_PAGES` independent of DB product visibility.
- Files to inspect/fix: `app/sitemap.ts`, `lib/catalog-seo.ts`, `lib/public-catalog/product-view.ts`
- Suggested fix: Include static SEO product pages only when intentionally supported or backed by an active product; otherwise exclude or noindex.
- Estimated risk: high

### H-08

- Severity: High
- Location: Analytics tracking
- Symptoms: Admin page views/clicks can pollute Google Analytics and Google Ads events.
- Likely cause: `GlobalClickTracker` and `PageViewTracker` are mounted in root layout for public and admin routes.
- Files to inspect/fix: `app/layout.tsx`, `components/analytics/GlobalClickTracker.tsx`, `components/analytics/PageViewTracker.tsx`
- Suggested fix: Exclude `/admin` from page view and conversion tracking.
- Estimated risk: low

### H-09

- Severity: High
- Location: Public catalog DB list DTO
- Symptoms: Catalog/search can see less data than product detail pages.
- Likely cause: DB adapter `getProducts()` does not load product specs/documents/images as fully as `getProductBySlug()`.
- Files to inspect/fix: `lib/public-catalog/db-adapter.ts`, `lib/catalog-query/engine.ts`, `lib/search/product-search.ts`
- Suggested fix: Either hydrate list DTOs with lightweight specs/images or ensure search/facets only depend on fields loaded in list mode.
- Estimated risk: medium

## Medium

### M-01

- Severity: Medium
- Location: Product carousel
- Symptoms: Public product view generation runs in a client component.
- Likely cause: `ProductShowcaseCarousel` imports and calls `buildPublicProductView()` directly.
- Files to inspect/fix: `components/sections/ProductShowcaseCarousel.tsx`
- Suggested fix: Build product preview DTOs server-side and pass plain data into the client carousel.
- Estimated risk: medium

### M-02

- Severity: Medium
- Location: Product and admin media image rendering
- Symptoms: Missing upload files render as broken image icons.
- Likely cause: Shared image frames do not provide a client-side `onError` fallback.
- Files to inspect/fix: `components/product/ProductImageFrame.tsx`, `components/admin/MediaUpload.tsx`
- Suggested fix: Add a safe fallback state for failed image loads.
- Estimated risk: low

### M-03

- Severity: Medium
- Location: WhatsApp analytics
- Symptoms: WhatsApp events can be double-counted or fired after failed form submission.
- Likely cause: Explicit WhatsApp tracking exists in `QuickRequestForm`, while global click tracking also catches WhatsApp links.
- Files to inspect/fix: `components/contacts/QuickRequestForm.tsx`, `components/analytics/GlobalClickTracker.tsx`
- Suggested fix: Deduplicate WhatsApp event sources and avoid counting automatic fallback redirects as manual clicks.
- Estimated risk: low

### M-04

- Severity: Medium
- Location: CMS metadata saves
- Symptoms: Metadata changes for some pages may not refresh sitemap timestamps promptly.
- Likely cause: Several page content save actions revalidate the page but not `/sitemap.xml`.
- Files to inspect/fix: `app/admin/content/actions.ts`
- Suggested fix: Revalidate `/sitemap.xml` consistently for pages with editable metadata.
- Estimated risk: low

### M-05

- Severity: Medium
- Location: Header/footer contacts
- Symptoms: Some visible contact values are not editable from CMS.
- Likely cause: Phone, email, social links, and company values come from `COMPANY` config while only labels around them are CMS-managed.
- Files to inspect/fix: `components/layout/Header.tsx`, `components/layout/Footer.tsx`, `lib/company.ts`
- Suggested fix: Decide whether company contact values are config-only or CMS-editable; label them clearly in admin.
- Estimated risk: medium

### M-06

- Severity: Medium
- Location: Category and catalog static copy
- Symptoms: Some category quick links, trust copy, and CTA text cannot be changed in admin.
- Likely cause: Static copy lives in catalog page/components and `lib/catalog-seo.ts`.
- Files to inspect/fix: `app/(site)/catalog/category/[categorySlug]/page.tsx`, `lib/catalog-seo.ts`
- Suggested fix: Add these fields to CMS only if managers need to control them; otherwise mark them as static in admin documentation.
- Estimated risk: medium

### M-07

- Severity: Medium
- Location: Catalog facets
- Symptoms: Filter/facet order may not match admin category/subcategory sort order.
- Likely cause: Facets are derived from matching products and sorted independently from admin `sort_order`.
- Files to inspect/fix: `lib/catalog-query/engine.ts`, `components/catalog/CatalogShell.tsx`
- Suggested fix: Preserve admin order metadata when building category and subcategory facets.
- Estimated risk: low

### M-08

- Severity: Medium
- Location: Certificate document compatibility cache
- Symptoms: After adding `document_media_id` in DB, app may still behave as if the column is absent until restart.
- Likely cause: Certificate document column existence is cached in process memory.
- Files to inspect/fix: `lib/services/certificates.ts`
- Suggested fix: Invalidate compatibility cache after migrations/deploy, or avoid persistent negative cache in production.
- Estimated risk: low

## Low

### L-01

- Severity: Low
- Location: Catalog root page metadata
- Symptoms: `/catalog` title/description are hardcoded.
- Likely cause: Catalog root page uses static metadata.
- Files to inspect/fix: `app/(site)/catalog/page.tsx`
- Suggested fix: Add CMS fields only if catalog root SEO is expected to be manager-editable.
- Estimated risk: low

### L-02

- Severity: Low
- Location: Product detail supporting copy
- Symptoms: Some trust/request/document helper text is static.
- Likely cause: Product detail route contains hardcoded support text around the generated product view.
- Files to inspect/fix: `app/(site)/tovar/[slug]/page.tsx`
- Suggested fix: Move repeated support copy to CMS or shared constants if managers need to edit it.
- Estimated risk: low

### L-03

- Severity: Low
- Location: Admin error UX
- Symptoms: Some delete/save failures can be shown as generic errors.
- Likely cause: Several server actions throw or redirect with short query messages instead of returning structured form state.
- Files to inspect/fix: `app/admin/certificates/actions.ts`, `app/admin/products/actions.ts`, `app/admin/categories/actions.ts`
- Suggested fix: Standardize admin action result messages and destructive-action errors.
- Estimated risk: low

### L-04

- Severity: Low
- Location: CMS image alt text
- Symptoms: Some CMS-managed images still use fixed or inferred alt text.
- Likely cause: Public page image models do not always expose separate alt fields.
- Files to inspect/fix: `lib/site-content/models.ts`, `app/(site)/certificates/page.tsx`, `app/(site)/delivery/page.tsx`
- Suggested fix: Add alt fields only for images that are truly manager-controlled and important for SEO/accessibility.
- Estimated risk: low

## Top 5 Fix Candidates

1. Stop silent DB-to-JSON fallback in production DB mode, or expose it loudly in admin diagnostics.
2. Add compatibility guard for `certificates.document_media_id` in media services.
3. Make gate-valve JSON-LD use the unified public product view.
4. Separate generated product fallback text from manually editable admin product content.
5. Exclude admin routes from analytics/page-view/conversion tracking.

## Validation

No code changes were made. Lint/build were not run for this read-only audit document.
