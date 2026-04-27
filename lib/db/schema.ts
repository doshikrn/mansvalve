/**
 * Drizzle ORM schema for the Mansvalve admin panel.
 *
 * Design notes:
 *   - Every admin-managed entity is a proper row in Postgres. The public
 *     site continues to read from the static JSON catalog until the feature
 *     flag `PUBLIC_CATALOG_FROM_DB` is flipped; at that point the same tables
 *     serve both the public site and the admin UI.
 *   - Ids use `bigserial` (auto-increment) except for `media_assets` which
 *     uses UUIDs because keys may be referenced by external CDN URLs and we
 *     don't want monotonically guessable identifiers.
 *   - `external_id` lets us keep a stable link back to the legacy JSON
 *     catalog during migration so re-importing doesn't duplicate rows.
 *   - Timestamps are stored with timezone and default to `now()`.
 */

import { sql } from "drizzle-orm";
import {
  bigserial,
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

/* -------------------------------------------------------------------------- */
/* Admin users                                                                */
/* -------------------------------------------------------------------------- */

export const adminUsers = pgTable(
  "admin_users",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    name: varchar("name", { length: 120 }),
    role: varchar("role", { length: 32 }).notNull().default("admin"),
    isActive: boolean("is_active").notNull().default(true),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("admin_users_email_idx").on(table.email)],
);

export type AdminUser = typeof adminUsers.$inferSelect;
export type NewAdminUser = typeof adminUsers.$inferInsert;

/* -------------------------------------------------------------------------- */
/* Categories / subcategories                                                 */
/* -------------------------------------------------------------------------- */

export const categories = pgTable(
  "categories",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    slug: varchar("slug", { length: 160 }).notNull(),
    name: varchar("name", { length: 200 }).notNull(),
    /** Short intro / body copy (admin + optional public use). */
    description: text("description"),
    /** Overrides meta description when set (public category page). */
    seoMetaDescription: text("seo_meta_description"),
    /**
     * Rich SEO blocks (top/trust/bottom/CTA). Shape matches `CategorySeoContent`
     * in `lib/category-content.ts`; validated in the service layer.
     */
    seoContent: jsonb("seo_content"),
    /** Optional hero image URL (e.g. from media library). */
    heroImageUrl: varchar("hero_image_url", { length: 1000 }),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    /** Stable identifier from legacy JSON (e.g. "zadvizhki"). */
    externalId: varchar("external_id", { length: 160 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("categories_slug_idx").on(table.slug),
    uniqueIndex("categories_external_id_idx").on(table.externalId),
  ],
);

export const subcategories = pgTable(
  "subcategories",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    slug: varchar("slug", { length: 160 }).notNull(),
    name: varchar("name", { length: 200 }).notNull(),
    description: text("description"),
    /** Overrides Open Graph / meta description when set. */
    seoMetaDescription: text("seo_meta_description"),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    externalId: varchar("external_id", { length: 160 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("subcategories_slug_idx").on(table.slug),
    uniqueIndex("subcategories_external_id_idx").on(table.externalId),
    index("subcategories_category_idx").on(table.categoryId),
  ],
);

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Subcategory = typeof subcategories.$inferSelect;
export type NewSubcategory = typeof subcategories.$inferInsert;

/* -------------------------------------------------------------------------- */
/* Media assets                                                               */
/* -------------------------------------------------------------------------- */

export const mediaAssets = pgTable(
  "media_assets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Storage key inside the configured media driver (e.g. "products/abc.jpg"). */
    storageKey: varchar("storage_key", { length: 500 }).notNull(),
    /** Public URL (absolute or relative) used when rendering the asset. */
    url: varchar("url", { length: 1000 }).notNull(),
    mimeType: varchar("mime_type", { length: 100 }).notNull(),
    sizeBytes: integer("size_bytes").notNull().default(0),
    width: integer("width"),
    height: integer("height"),
    alt: varchar("alt", { length: 300 }),
    driver: varchar("driver", { length: 32 }).notNull(),
    createdBy: integer("created_by").references(() => adminUsers.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("media_assets_storage_key_idx").on(table.storageKey)],
);

export type MediaAsset = typeof mediaAssets.$inferSelect;
export type NewMediaAsset = typeof mediaAssets.$inferInsert;

/* -------------------------------------------------------------------------- */
/* Products                                                                   */
/* -------------------------------------------------------------------------- */

export const products = pgTable(
  "products",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    slug: varchar("slug", { length: 200 }).notNull(),
    name: varchar("name", { length: 300 }).notNull(),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    subcategoryId: integer("subcategory_id").references(
      () => subcategories.id,
      { onDelete: "set null" },
    ),

    /** Denormalized snapshots for fast rendering / search. */
    categoryName: varchar("category_name", { length: 200 }).notNull(),
    subcategoryName: varchar("subcategory_name", { length: 200 }),

    dn: integer("dn"),
    pn: integer("pn"),
    thread: varchar("thread", { length: 60 }),
    material: varchar("material", { length: 120 }),
    connectionType: varchar("connection_type", { length: 120 }),
    controlType: varchar("control_type", { length: 120 }),
    model: varchar("model", { length: 120 }),

    price: numeric("price", { precision: 14, scale: 2 }),
    priceByRequest: boolean("price_by_request").notNull().default(true),
    weight: numeric("weight", { precision: 10, scale: 3 }),

    shortDescription: text("short_description"),
    longDescription: text("long_description"),

    isActive: boolean("is_active").notNull().default(true),
    isFeatured: boolean("is_featured").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),

    /** Legacy JSON id — used by the import script to upsert. */
    externalId: varchar("external_id", { length: 120 }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("products_slug_idx").on(table.slug),
    uniqueIndex("products_external_id_idx").on(table.externalId),
    index("products_category_idx").on(table.categoryId),
    index("products_subcategory_idx").on(table.subcategoryId),
    index("products_is_active_idx").on(table.isActive),
  ],
);

export const productSpecs = pgTable(
  "product_specs",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    key: varchar("key", { length: 120 }).notNull(),
    value: varchar("value", { length: 500 }).notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [index("product_specs_product_idx").on(table.productId)],
);

export const productImages = pgTable(
  "product_images",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    mediaId: uuid("media_id")
      .notNull()
      .references(() => mediaAssets.id, { onDelete: "restrict" }),
    alt: varchar("alt", { length: 300 }),
    isPrimary: boolean("is_primary").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("product_images_product_idx").on(table.productId),
    index("product_images_primary_idx").on(table.productId, table.isPrimary),
  ],
);

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type ProductSpec = typeof productSpecs.$inferSelect;
export type NewProductSpec = typeof productSpecs.$inferInsert;
export type ProductImage = typeof productImages.$inferSelect;
export type NewProductImage = typeof productImages.$inferInsert;

/* -------------------------------------------------------------------------- */
/* Certificates                                                               */
/* -------------------------------------------------------------------------- */

export const certificates = pgTable(
  "certificates",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    title: varchar("title", { length: 300 }).notNull(),
    description: text("description"),
    mediaAssetId: uuid("media_asset_id")
      .notNull()
      .references(() => mediaAssets.id, { onDelete: "restrict" }),
    issuedAt: timestamp("issued_at", { withTimezone: true }),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("certificates_is_active_idx").on(table.isActive),
    index("certificates_sort_order_idx").on(table.sortOrder),
    index("certificates_media_asset_idx").on(table.mediaAssetId),
  ],
);

export type Certificate = typeof certificates.$inferSelect;
export type NewCertificate = typeof certificates.$inferInsert;

/* -------------------------------------------------------------------------- */
/* Leads                                                                      */
/* -------------------------------------------------------------------------- */

/** Values allowed for new writes / admin UI. Legacy DB rows may still contain `won` or `lost`. */
export const leadStatusValues = ["new", "in_progress", "done", "spam"] as const;

export type LeadStatus = (typeof leadStatusValues)[number];

export type LeadStatusInDb = LeadStatus | "won" | "lost";

export const leads = pgTable(
  "leads",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),

    name: varchar("name", { length: 200 }).notNull(),
    phone: varchar("phone", { length: 64 }).notNull(),
    email: varchar("email", { length: 255 }),
    comment: text("comment"),

    /** Context of the form submission. */
    source: varchar("source", { length: 160 }),
    page: varchar("page", { length: 500 }),

    productName: varchar("product_name", { length: 300 }),
    productSlug: varchar("product_slug", { length: 200 }),
    productCategory: varchar("product_category", { length: 160 }),
    productSubcategory: varchar("product_subcategory", { length: 160 }),
    productId: integer("product_id").references(() => products.id, {
      onDelete: "set null",
    }),

    /** Full attribution payload (UTM + first-touch) as JSON for flexibility. */
    attribution: jsonb("attribution")
      .notNull()
      .default(sql`'{}'::jsonb`),

    ip: varchar("ip", { length: 64 }),
    userAgent: varchar("user_agent", { length: 500 }),

    status: varchar("status", { length: 32 })
      .notNull()
      .$type<LeadStatusInDb>()
      .default("new"),

    /** Telegram delivery bookkeeping. */
    telegramDelivered: boolean("telegram_delivered").notNull().default(false),
    telegramMessageId: varchar("telegram_message_id", { length: 64 }),
    telegramError: text("telegram_error"),

    /** Operator ownership. */
    assignedTo: integer("assigned_to").references(() => adminUsers.id, {
      onDelete: "set null",
    }),
    handledAt: timestamp("handled_at", { withTimezone: true }),
    internalNote: text("internal_note"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("leads_status_idx").on(table.status),
    index("leads_created_at_idx").on(table.createdAt),
    index("leads_phone_idx").on(table.phone),
  ],
);

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;

/* -------------------------------------------------------------------------- */
/* Content blocks + company settings                                          */
/* -------------------------------------------------------------------------- */

/**
 * Free-form content storage for SEO blocks / landing sections that the
 * marketing team will manage from the admin panel (e.g. category SEO text,
 * hero copy, FAQ items).
 *
 * `key` is a stable identifier (e.g. `category.zadvizhki.seo`), `locale` is
 * the language (ru/en/kk). `data` is a JSON payload whose shape is defined
 * per-key in the service layer so the admin form can render the right fields.
 */
export const contentBlocks = pgTable(
  "content_blocks",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    key: varchar("key", { length: 200 }).notNull(),
    locale: varchar("locale", { length: 10 }).notNull().default("ru"),
    title: varchar("title", { length: 300 }),
    data: jsonb("data")
      .notNull()
      .default(sql`'{}'::jsonb`),
    updatedBy: integer("updated_by").references(() => adminUsers.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("content_blocks_key_locale_idx").on(table.key, table.locale),
  ],
);

export type ContentBlock = typeof contentBlocks.$inferSelect;
export type NewContentBlock = typeof contentBlocks.$inferInsert;

/**
 * Singleton table (one row) that stores the editable company profile:
 * contacts, bank details, social links, WhatsApp number, etc.
 *
 * We enforce singleton-ness via a `CHECK (id = 1)` — every call updates row
 * id = 1 or inserts it.
 */
export const companySettings = pgTable("company_settings", {
  id: integer("id").primaryKey().default(1),
  data: jsonb("data")
    .notNull()
    .default(sql`'{}'::jsonb`),
  updatedBy: integer("updated_by").references(() => adminUsers.id, {
    onDelete: "set null",
  }),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type CompanySettings = typeof companySettings.$inferSelect;

/* -------------------------------------------------------------------------- */
/* Audit log                                                                  */
/* -------------------------------------------------------------------------- */

export const auditLog = pgTable(
  "audit_log",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    actorId: integer("actor_id").references(() => adminUsers.id, {
      onDelete: "set null",
    }),
    action: varchar("action", { length: 64 }).notNull(),
    entityType: varchar("entity_type", { length: 64 }).notNull(),
    entityId: varchar("entity_id", { length: 64 }),
    diff: jsonb("diff"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("audit_log_entity_idx").on(table.entityType, table.entityId),
    index("audit_log_actor_idx").on(table.actorId),
  ],
);

export type AuditLogEntry = typeof auditLog.$inferSelect;
export type NewAuditLogEntry = typeof auditLog.$inferInsert;
