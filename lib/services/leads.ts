import "server-only";

import {
  and,
  asc,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  lte,
  or,
  sql,
} from "drizzle-orm";

import { getDb, isDatabaseConfigured } from "@/lib/db/client";
import {
  leads as leadsTable,
  type Lead,
  type LeadStatus,
  type LeadStatusInDb,
  type NewLead,
} from "@/lib/db/schema";

const DONE_STATUSES: LeadStatusInDb[] = ["done", "won", "lost"];

/** Soft dedup window for public request forms (double-submit protection). */
export const LEAD_DEDUP_WINDOW_MS = 15 * 60 * 1000;

export function normalizeLeadPhoneDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function leadPhoneTail(phone: string): string {
  const digits = normalizeLeadPhoneDigits(phone);
  return digits.length >= 4 ? digits.slice(-4) : digits;
}

export type LeadListOptions = {
  status?: LeadStatus;
  source?: string;
  /** ISO date string (yyyy-mm-dd), start of day UTC-ish via Date parse */
  dateFrom?: string;
  dateTo?: string;
  /** Search name / phone / comment (admin-only) */
  q?: string;
  page?: number;
  pageSize?: number;
};

export type LeadListResult = {
  items: Lead[];
  total: number;
  page: number;
  pageSize: number;
};

function statusFilterCondition(status: LeadStatus) {
  if (status === "done") {
    return inArray(leadsTable.status, DONE_STATUSES);
  }
  return eq(leadsTable.status, status);
}

function countStatusCondition(status?: LeadStatus) {
  if (!status) return undefined;
  return statusFilterCondition(status);
}

export async function listLeads(options: LeadListOptions = {}): Promise<LeadListResult> {
  const {
    status,
    source,
    dateFrom,
    dateTo,
    q,
    page = 1,
    pageSize = 25,
  } = options;
  const db = getDb();
  const offset = (Math.max(1, page) - 1) * pageSize;

  const conditions = [];

  if (status) {
    conditions.push(statusFilterCondition(status));
  }

  if (source && source !== "__all__") {
    conditions.push(eq(leadsTable.source, source));
  }

  if (dateFrom?.trim()) {
    const from = new Date(dateFrom.trim());
    if (!Number.isNaN(from.getTime())) {
      conditions.push(gte(leadsTable.createdAt, from));
    }
  }

  if (dateTo?.trim()) {
    const to = new Date(dateTo.trim());
    if (!Number.isNaN(to.getTime())) {
      to.setHours(23, 59, 59, 999);
      conditions.push(lte(leadsTable.createdAt, to));
    }
  }

  const rawQ = q?.trim();
  if (rawQ) {
    const safe = rawQ.replace(/[%_\\]/g, " ");
    const pattern = `%${safe}%`;
    conditions.push(
      or(
        ilike(leadsTable.name, pattern),
        ilike(leadsTable.phone, pattern),
        ilike(leadsTable.comment, pattern),
      ),
    );
  }

  const whereClause = conditions.length ? and(...conditions) : undefined;

  const rowsQuery = db.select().from(leadsTable);
  const filteredRows = whereClause ? rowsQuery.where(whereClause) : rowsQuery;

  const countQuery = db
    .select({ value: sql<number>`count(*)::int` })
    .from(leadsTable);
  const filteredCount = whereClause ? countQuery.where(whereClause) : countQuery;

  const [items, countRow] = await Promise.all([
    filteredRows
      .orderBy(desc(leadsTable.createdAt))
      .limit(pageSize)
      .offset(offset),
    filteredCount,
  ]);

  return {
    items,
    total: countRow[0]?.value ?? 0,
    page,
    pageSize,
  };
}

export async function countLeads(status?: LeadStatus): Promise<number> {
  const db = getDb();
  const whereClause = countStatusCondition(status);
  const base = db.select({ value: sql<number>`count(*)::int` }).from(leadsTable);
  const rows = await (whereClause ? base.where(whereClause) : base);
  return rows[0]?.value ?? 0;
}

export async function listLeadSourceOptions(): Promise<string[]> {
  const db = getDb();
  const rows = await db
    .select({ source: leadsTable.source })
    .from(leadsTable)
    .where(sql`coalesce(trim(${leadsTable.source}), '') <> ''`)
    .groupBy(leadsTable.source)
    .orderBy(asc(leadsTable.source));
  return rows.map((r) => r.source!).filter(Boolean);
}

export async function getLeadById(id: number): Promise<Lead | undefined> {
  const db = getDb();
  const rows = await db.select().from(leadsTable).where(eq(leadsTable.id, id)).limit(1);
  return rows[0];
}

export async function updateLead(
  id: number,
  patch: {
    status?: LeadStatus;
    internalNote?: string | null;
  },
): Promise<void> {
  const db = getDb();
  await db
    .update(leadsTable)
    .set({
      ...patch,
      updatedAt: new Date(),
    })
    .where(eq(leadsTable.id, id));
}

export async function createLead(payload: NewLead): Promise<number> {
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_URL is not configured");
  }

  const db = getDb();
  const inserted = await db
    .insert(leadsTable)
    .values(payload)
    .returning({ id: leadsTable.id });

  const id = inserted[0]?.id;
  if (!id) {
    throw new Error("Lead insert did not return id");
  }

  return id;
}

export type CreateLeadWithDedupResult = {
  id: number;
  duplicate: boolean;
};

/**
 * Returns a recent lead with the same normalized phone (digits only) if created within the window.
 */
export async function findRecentLeadByPhone(options: {
  phone: string;
  withinMs?: number;
}): Promise<Lead | undefined> {
  if (!isDatabaseConfigured()) {
    return undefined;
  }

  const digits = normalizeLeadPhoneDigits(options.phone);
  if (digits.length < 11) {
    return undefined;
  }

  const since = new Date(Date.now() - (options.withinMs ?? LEAD_DEDUP_WINDOW_MS));
  const db = getDb();

  const rows = await db
    .select()
    .from(leadsTable)
    .where(
      and(
        gte(leadsTable.createdAt, since),
        sql`regexp_replace(${leadsTable.phone}, '[^0-9]', '', 'g') = ${digits}`,
      ),
    )
    .orderBy(desc(leadsTable.createdAt))
    .limit(1);

  return rows[0];
}

/** Inserts a lead unless the same phone was submitted within the dedup window. */
export async function createLeadWithDedup(
  payload: NewLead,
  options?: { withinMs?: number },
): Promise<CreateLeadWithDedupResult> {
  const existing = await findRecentLeadByPhone({
    phone: payload.phone,
    withinMs: options?.withinMs,
  });

  if (existing?.id) {
    return { id: existing.id, duplicate: true };
  }

  const id = await createLead(payload);
  return { id, duplicate: false };
}

/**
 * Best-effort persistence helper for non-critical background imports.
 * Public request forms must use `createLead` so failed DB writes are visible.
 */
export async function persistLeadSafely(
  payload: NewLead,
): Promise<{ id: number | null; error: string | null }> {
  if (!isDatabaseConfigured()) {
    return { id: null, error: "db_not_configured" };
  }

  try {
    return { id: await createLead(payload), error: null };
  } catch (error) {
    console.error("[leads] failed to persist lead", error);
    return {
      id: null,
      error: error instanceof Error ? error.message : "unknown_error",
    };
  }
}
