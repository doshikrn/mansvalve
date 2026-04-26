import "server-only";

import { and, asc, eq, like } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import {
  contentBlocks as contentBlocksTable,
  type ContentBlock,
  type NewContentBlock,
} from "@/lib/db/schema";

const DEFAULT_LOCALE = "ru";

export async function getContentBlock(
  key: string,
  locale: string = DEFAULT_LOCALE,
): Promise<ContentBlock | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(contentBlocksTable)
    .where(and(eq(contentBlocksTable.key, key), eq(contentBlocksTable.locale, locale)))
    .limit(1);
  return rows[0] ?? null;
}

export async function listContentBlocksByPrefix(
  prefix: string,
  locale: string = DEFAULT_LOCALE,
): Promise<ContentBlock[]> {
  const db = getDb();
  return db
    .select()
    .from(contentBlocksTable)
    .where(
      and(
        like(contentBlocksTable.key, `${prefix.replace(/%/g, "")}%`),
        eq(contentBlocksTable.locale, locale),
      ),
    )
    .orderBy(asc(contentBlocksTable.key));
}

export async function upsertContentBlock(input: {
  key: string;
  locale?: string;
  title?: string | null;
  data: Record<string, unknown>;
  updatedBy?: number | null;
}): Promise<void> {
  const db = getDb();
  const locale = input.locale ?? DEFAULT_LOCALE;
  const existing = await getContentBlock(input.key, locale);

  if (existing) {
    await db
      .update(contentBlocksTable)
      .set({
        title: input.title ?? existing.title,
        data: input.data,
        updatedBy: input.updatedBy ?? null,
        updatedAt: new Date(),
      })
      .where(eq(contentBlocksTable.id, existing.id));
    return;
  }

  const row: NewContentBlock = {
    key: input.key,
    locale,
    title: input.title ?? null,
    data: input.data,
    updatedBy: input.updatedBy ?? null,
  };
  await db.insert(contentBlocksTable).values(row);
}
