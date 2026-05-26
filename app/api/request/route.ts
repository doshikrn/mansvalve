import { NextResponse } from "next/server";
import {
  createLeadWithDedup,
  leadPhoneTail,
} from "@/lib/services/leads";

export const runtime = "nodejs";

const MAX_NAME_LENGTH = 120;
const MAX_PHONE_LENGTH = 32;
const MAX_COMMENT_LENGTH = 1000;
const MAX_SOURCE_LENGTH = 120;
const MAX_PAGE_LENGTH = 200;
const MAX_HONEYPOT_LENGTH = 128;
const MAX_USER_AGENT_LENGTH = 200;
const MAX_PRODUCT_NAME_LENGTH = 180;
const MAX_PRODUCT_SLUG_LENGTH = 180;
const MAX_PRODUCT_CATEGORY_LENGTH = 120;
const MAX_PRODUCT_SUBCATEGORY_LENGTH = 120;
const MAX_UTM_FIELD_LENGTH = 120;
const MAX_REFERRER_LENGTH = 500;
const MAX_FIRST_LANDING_PATH_LENGTH = 500;
const MAX_FIRST_TOUCH_AT_LENGTH = 64;

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const RATE_LIMIT_MAX_BUCKETS = 5000;

type RequestPayload = {
  name?: unknown;
  phone?: unknown;
  comment?: unknown;
  source?: unknown;
  page?: unknown;
  website?: unknown;
  productName?: unknown;
  productSlug?: unknown;
  productCategory?: unknown;
  productSubcategory?: unknown;
  utm_source?: unknown;
  utm_medium?: unknown;
  utm_campaign?: unknown;
  utm_term?: unknown;
  utm_content?: unknown;
  gclid?: unknown;
  yclid?: unknown;
  fbclid?: unknown;
  referrer?: unknown;
  first_utm_source?: unknown;
  first_utm_medium?: unknown;
  first_utm_campaign?: unknown;
  first_utm_term?: unknown;
  first_utm_content?: unknown;
  first_gclid?: unknown;
  first_yclid?: unknown;
  first_fbclid?: unknown;
  first_referrer?: unknown;
  first_landing_path?: unknown;
  first_touch_at?: unknown;
};

type ValidPayload = {
  name: string;
  phone: string;
  comment: string;
  source: string;
  page: string;
  website: string;
  productName: string;
  productSlug: string;
  productCategory: string;
  productSubcategory: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_term: string;
  utm_content: string;
  gclid: string;
  yclid: string;
  fbclid: string;
  referrer: string;
  first_utm_source: string;
  first_utm_medium: string;
  first_utm_campaign: string;
  first_utm_term: string;
  first_utm_content: string;
  first_gclid: string;
  first_yclid: string;
  first_fbclid: string;
  first_referrer: string;
  first_landing_path: string;
  first_touch_at: string;
};

type AuditStatus = "success" | "failed" | "spam" | "rate_limited" | "duplicate";

type AuditFields = {
  source: string;
  page: string;
  name: string;
  phone: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_term: string;
  utm_content: string;
  gclid: string;
  yclid: string;
  fbclid: string;
  referrer: string;
  first_utm_source: string;
  first_utm_medium: string;
  first_utm_campaign: string;
  first_utm_term: string;
  first_utm_content: string;
  first_gclid: string;
  first_yclid: string;
  first_fbclid: string;
  first_referrer: string;
  first_landing_path: string;
  first_touch_at: string;
};

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const rateLimitBuckets = new Map<string, RateLimitBucket>();

function cleanNullableRecord(
  record: Record<string, string | null>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(record).filter(
      (entry): entry is [string, string] =>
        typeof entry[1] === "string" && entry[1].trim().length > 0,
    ),
  );
}

function toTrimmedString(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function normalizeIsoTimestamp(value: unknown): string {
  const raw = toTrimmedString(value, MAX_FIRST_TOUCH_AT_LENGTH);
  if (!raw) return "";

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString();
}

function extractAuditFields(payload: unknown): AuditFields {
  if (!payload || typeof payload !== "object") {
    return {
      source: "unknown",
      page: "unknown",
      name: "",
      phone: "",
      utm_source: "",
      utm_medium: "",
      utm_campaign: "",
      utm_term: "",
      utm_content: "",
      gclid: "",
      yclid: "",
      fbclid: "",
      referrer: "",
      first_utm_source: "",
      first_utm_medium: "",
      first_utm_campaign: "",
      first_utm_term: "",
      first_utm_content: "",
      first_gclid: "",
      first_yclid: "",
      first_fbclid: "",
      first_referrer: "",
      first_landing_path: "",
      first_touch_at: "",
    };
  }

  const raw = payload as RequestPayload;
  return {
    source: toTrimmedString(raw.source, MAX_SOURCE_LENGTH) || "unknown",
    page: toTrimmedString(raw.page, MAX_PAGE_LENGTH) || "unknown",
    name: toTrimmedString(raw.name, MAX_NAME_LENGTH),
    phone: toTrimmedString(raw.phone, MAX_PHONE_LENGTH),
    utm_source: toTrimmedString(raw.utm_source, MAX_UTM_FIELD_LENGTH),
    utm_medium: toTrimmedString(raw.utm_medium, MAX_UTM_FIELD_LENGTH),
    utm_campaign: toTrimmedString(raw.utm_campaign, MAX_UTM_FIELD_LENGTH),
    utm_term: toTrimmedString(raw.utm_term, MAX_UTM_FIELD_LENGTH),
    utm_content: toTrimmedString(raw.utm_content, MAX_UTM_FIELD_LENGTH),
    gclid: toTrimmedString(raw.gclid, MAX_UTM_FIELD_LENGTH),
    yclid: toTrimmedString(raw.yclid, MAX_UTM_FIELD_LENGTH),
    fbclid: toTrimmedString(raw.fbclid, MAX_UTM_FIELD_LENGTH),
    referrer: toTrimmedString(raw.referrer, MAX_REFERRER_LENGTH),
    first_utm_source: toTrimmedString(raw.first_utm_source, MAX_UTM_FIELD_LENGTH),
    first_utm_medium: toTrimmedString(raw.first_utm_medium, MAX_UTM_FIELD_LENGTH),
    first_utm_campaign: toTrimmedString(raw.first_utm_campaign, MAX_UTM_FIELD_LENGTH),
    first_utm_term: toTrimmedString(raw.first_utm_term, MAX_UTM_FIELD_LENGTH),
    first_utm_content: toTrimmedString(raw.first_utm_content, MAX_UTM_FIELD_LENGTH),
    first_gclid: toTrimmedString(raw.first_gclid, MAX_UTM_FIELD_LENGTH),
    first_yclid: toTrimmedString(raw.first_yclid, MAX_UTM_FIELD_LENGTH),
    first_fbclid: toTrimmedString(raw.first_fbclid, MAX_UTM_FIELD_LENGTH),
    first_referrer: toTrimmedString(raw.first_referrer, MAX_REFERRER_LENGTH),
    first_landing_path: toTrimmedString(
      raw.first_landing_path,
      MAX_FIRST_LANDING_PATH_LENGTH,
    ),
    first_touch_at: normalizeIsoTimestamp(raw.first_touch_at),
  };
}

function logAudit(
  status: AuditStatus,
  fields: AuditFields,
  error?: string,
) {
  const entry = {
    timestamp: new Date().toISOString(),
    source: fields.source,
    page: fields.page,
    name: fields.name,
    phone: fields.phone,
    utm_source: fields.utm_source || null,
    utm_medium: fields.utm_medium || null,
    utm_campaign: fields.utm_campaign || null,
    utm_term: fields.utm_term || null,
    utm_content: fields.utm_content || null,
    gclid: fields.gclid || null,
    yclid: fields.yclid || null,
    fbclid: fields.fbclid || null,
    referrer: fields.referrer || null,
    first_utm_source: fields.first_utm_source || null,
    first_utm_medium: fields.first_utm_medium || null,
    first_utm_campaign: fields.first_utm_campaign || null,
    first_utm_term: fields.first_utm_term || null,
    first_utm_content: fields.first_utm_content || null,
    first_gclid: fields.first_gclid || null,
    first_yclid: fields.first_yclid || null,
    first_fbclid: fields.first_fbclid || null,
    first_referrer: fields.first_referrer || null,
    first_landing_path: fields.first_landing_path || null,
    first_touch_at: fields.first_touch_at || null,
    status,
    error: error ?? null,
  };

  const line = `[request_api_audit] ${JSON.stringify(entry)}`;
  if (status === "success" || status === "duplicate") {
    console.info(line);
    return;
  }
  if (status === "spam") {
    console.warn(line);
    return;
  }
  console.error(line);
}

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  return "unknown-ip";
}

function buildRateLimitKey(request: Request): string {
  const ip = getClientIp(request);
  const userAgent =
    toTrimmedString(request.headers.get("user-agent"), MAX_USER_AGENT_LENGTH) ||
    "unknown-ua";

  return `${ip}|${userAgent}`;
}

function pruneRateLimitBuckets(now: number) {
  if (rateLimitBuckets.size < RATE_LIMIT_MAX_BUCKETS) return;

  for (const [key, bucket] of rateLimitBuckets) {
    if (bucket.resetAt <= now) {
      rateLimitBuckets.delete(key);
    }

    if (rateLimitBuckets.size <= RATE_LIMIT_MAX_BUCKETS * 0.8) {
      break;
    }
  }
}

function checkRateLimit(request: Request): {
  limited: boolean;
  retryAfterSeconds: number;
} {
  const now = Date.now();
  pruneRateLimitBuckets(now);

  const key = buildRateLimitKey(request);
  const bucket = rateLimitBuckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    rateLimitBuckets.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return { limited: false, retryAfterSeconds: 0 };
  }

  if (bucket.count >= RATE_LIMIT_MAX_REQUESTS) {
    return {
      limited: true,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  return { limited: false, retryAfterSeconds: 0 };
}

function validatePayload(payload: unknown): { ok: true; data: ValidPayload } | { ok: false; error: string } {
  if (!payload || typeof payload !== "object") {
    return { ok: false, error: "Некорректный формат запроса." };
  }

  const raw = payload as RequestPayload;
  const name = toTrimmedString(raw.name, MAX_NAME_LENGTH);
  const phone = toTrimmedString(raw.phone, MAX_PHONE_LENGTH);
  const comment = toTrimmedString(raw.comment, MAX_COMMENT_LENGTH);
  const source = toTrimmedString(raw.source, MAX_SOURCE_LENGTH);
  const page = toTrimmedString(raw.page, MAX_PAGE_LENGTH);
  const website = toTrimmedString(raw.website, MAX_HONEYPOT_LENGTH);
  const productName = toTrimmedString(raw.productName, MAX_PRODUCT_NAME_LENGTH);
  const productSlug = toTrimmedString(raw.productSlug, MAX_PRODUCT_SLUG_LENGTH);
  const productCategory = toTrimmedString(raw.productCategory, MAX_PRODUCT_CATEGORY_LENGTH);
  const productSubcategory = toTrimmedString(
    raw.productSubcategory,
    MAX_PRODUCT_SUBCATEGORY_LENGTH,
  );
  const utm_source = toTrimmedString(raw.utm_source, MAX_UTM_FIELD_LENGTH);
  const utm_medium = toTrimmedString(raw.utm_medium, MAX_UTM_FIELD_LENGTH);
  const utm_campaign = toTrimmedString(raw.utm_campaign, MAX_UTM_FIELD_LENGTH);
  const utm_term = toTrimmedString(raw.utm_term, MAX_UTM_FIELD_LENGTH);
  const utm_content = toTrimmedString(raw.utm_content, MAX_UTM_FIELD_LENGTH);
  const gclid = toTrimmedString(raw.gclid, MAX_UTM_FIELD_LENGTH);
  const yclid = toTrimmedString(raw.yclid, MAX_UTM_FIELD_LENGTH);
  const fbclid = toTrimmedString(raw.fbclid, MAX_UTM_FIELD_LENGTH);
  const referrer = toTrimmedString(raw.referrer, MAX_REFERRER_LENGTH);
  const first_utm_source = toTrimmedString(raw.first_utm_source, MAX_UTM_FIELD_LENGTH);
  const first_utm_medium = toTrimmedString(raw.first_utm_medium, MAX_UTM_FIELD_LENGTH);
  const first_utm_campaign = toTrimmedString(raw.first_utm_campaign, MAX_UTM_FIELD_LENGTH);
  const first_utm_term = toTrimmedString(raw.first_utm_term, MAX_UTM_FIELD_LENGTH);
  const first_utm_content = toTrimmedString(raw.first_utm_content, MAX_UTM_FIELD_LENGTH);
  const first_gclid = toTrimmedString(raw.first_gclid, MAX_UTM_FIELD_LENGTH);
  const first_yclid = toTrimmedString(raw.first_yclid, MAX_UTM_FIELD_LENGTH);
  const first_fbclid = toTrimmedString(raw.first_fbclid, MAX_UTM_FIELD_LENGTH);
  const first_referrer = toTrimmedString(raw.first_referrer, MAX_REFERRER_LENGTH);
  const first_landing_path = toTrimmedString(
    raw.first_landing_path,
    MAX_FIRST_LANDING_PATH_LENGTH,
  );
  const first_touch_at = normalizeIsoTimestamp(raw.first_touch_at);

  if (name.length < 2) {
    return { ok: false, error: "Укажите имя или название компании." };
  }

  const phoneDigits = phone.replace(/\D/g, "");
  if (phoneDigits.length < 11) {
    return { ok: false, error: "Укажите корректный номер телефона." };
  }

  return {
    ok: true,
    data: {
      name,
      phone,
      comment,
      source,
      page,
      website,
      productName,
      productSlug,
      productCategory,
      productSubcategory,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_term,
      utm_content,
      gclid,
      yclid,
      fbclid,
      referrer,
      first_utm_source,
      first_utm_medium,
      first_utm_campaign,
      first_utm_term,
      first_utm_content,
      first_gclid,
      first_yclid,
      first_fbclid,
      first_referrer,
      first_landing_path,
      first_touch_at,
    },
  };
}

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(request);
  if (rateLimit.limited) {
    logAudit(
      "rate_limited",
      {
        source: "unknown",
        page: "unknown",
        name: "",
        phone: "",
        utm_source: "",
        utm_medium: "",
        utm_campaign: "",
        utm_term: "",
        utm_content: "",
        gclid: "",
        yclid: "",
        fbclid: "",
        referrer: "",
        first_utm_source: "",
        first_utm_medium: "",
        first_utm_campaign: "",
        first_utm_term: "",
        first_utm_content: "",
        first_gclid: "",
        first_yclid: "",
        first_fbclid: "",
        first_referrer: "",
        first_landing_path: "",
        first_touch_at: "",
      },
      "rate_limit_exceeded",
    );

    return NextResponse.json(
      {
        ok: false,
        error: "Слишком много запросов. Попробуйте немного позже.",
        code: "rate_limit_exceeded",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
      },
    );
  }

  let payload: unknown;
  let fields: AuditFields = {
    source: "unknown",
    page: "unknown",
    name: "",
    phone: "",
    utm_source: "",
    utm_medium: "",
    utm_campaign: "",
    utm_term: "",
    utm_content: "",
    gclid: "",
    yclid: "",
    fbclid: "",
    referrer: "",
    first_utm_source: "",
    first_utm_medium: "",
    first_utm_campaign: "",
    first_utm_term: "",
    first_utm_content: "",
    first_gclid: "",
    first_yclid: "",
    first_fbclid: "",
    first_referrer: "",
    first_landing_path: "",
    first_touch_at: "",
  };

  try {
    payload = await request.json();
    fields = extractAuditFields(payload);
  } catch {
    logAudit("failed", fields, "invalid_json");
    return NextResponse.json({ ok: false, error: "Некорректный JSON в запросе." }, { status: 400 });
  }

  const parsed = validatePayload(payload);
  if (!parsed.ok) {
    logAudit("failed", fields, parsed.error);
    return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
  }

  fields = {
    source: parsed.data.source || "unknown",
    page: parsed.data.page || "unknown",
    name: parsed.data.name,
    phone: parsed.data.phone,
    utm_source: parsed.data.utm_source,
    utm_medium: parsed.data.utm_medium,
    utm_campaign: parsed.data.utm_campaign,
    utm_term: parsed.data.utm_term,
    utm_content: parsed.data.utm_content,
    gclid: parsed.data.gclid,
    yclid: parsed.data.yclid,
    fbclid: parsed.data.fbclid,
    referrer: parsed.data.referrer,
    first_utm_source: parsed.data.first_utm_source,
    first_utm_medium: parsed.data.first_utm_medium,
    first_utm_campaign: parsed.data.first_utm_campaign,
    first_utm_term: parsed.data.first_utm_term,
    first_utm_content: parsed.data.first_utm_content,
    first_gclid: parsed.data.first_gclid,
    first_yclid: parsed.data.first_yclid,
    first_fbclid: parsed.data.first_fbclid,
    first_referrer: parsed.data.first_referrer,
    first_landing_path: parsed.data.first_landing_path,
    first_touch_at: parsed.data.first_touch_at,
  };

  if (parsed.data.website) {
    logAudit("spam", fields, "honeypot_filled");
    return NextResponse.json({ ok: true });
  }

  try {
    const leadResult = await createLeadWithDedup({
      name: parsed.data.name,
      phone: parsed.data.phone,
      comment: parsed.data.comment || null,
      source: parsed.data.source || "commercial_offer_form",
      page: parsed.data.page || null,
      productName: parsed.data.productName || null,
      productSlug: parsed.data.productSlug || null,
      productCategory: parsed.data.productCategory || null,
      productSubcategory: parsed.data.productSubcategory || null,
      attribution: cleanNullableRecord({
        utm_source: parsed.data.utm_source || null,
        utm_medium: parsed.data.utm_medium || null,
        utm_campaign: parsed.data.utm_campaign || null,
        utm_term: parsed.data.utm_term || null,
        utm_content: parsed.data.utm_content || null,
        gclid: parsed.data.gclid || null,
        yclid: parsed.data.yclid || null,
        fbclid: parsed.data.fbclid || null,
        referrer: parsed.data.referrer || null,
        first_utm_source: parsed.data.first_utm_source || null,
        first_utm_medium: parsed.data.first_utm_medium || null,
        first_utm_campaign: parsed.data.first_utm_campaign || null,
        first_utm_term: parsed.data.first_utm_term || null,
        first_utm_content: parsed.data.first_utm_content || null,
        first_gclid: parsed.data.first_gclid || null,
        first_yclid: parsed.data.first_yclid || null,
        first_fbclid: parsed.data.first_fbclid || null,
        first_referrer: parsed.data.first_referrer || null,
        first_landing_path: parsed.data.first_landing_path || null,
        first_touch_at: parsed.data.first_touch_at || null,
      }),
      ip: getClientIp(request),
      userAgent:
        toTrimmedString(request.headers.get("user-agent"), MAX_USER_AGENT_LENGTH) || null,
      status: "new",
    });

    if (leadResult.duplicate) {
      console.info("[request_api] duplicate_lead_detected", {
        existingLeadId: leadResult.id,
        phoneTail: leadPhoneTail(parsed.data.phone),
        source: fields.source,
        page: fields.page,
      });
      logAudit("duplicate", fields, `existing_lead_id:${leadResult.id}`);
      return NextResponse.json({
        ok: true,
        duplicate: true,
        id: leadResult.id,
      });
    }

    logAudit("success", fields);
    return NextResponse.json({ ok: true, id: leadResult.id });
  } catch (error) {
    const persistError =
      error instanceof Error ? error.message : "unknown_persist_error";
    console.error("[request_api] lead_persist_failed", {
      source: fields.source,
      page: fields.page,
      phone: fields.phone,
      error: persistError,
    });
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
    logAudit("failed", fields, `lead_persist_failed:${persistError}`);
    return NextResponse.json(
      {
        ok: false,
        error: "Не удалось сохранить заявку. Проверьте данные и попробуйте ещё раз.",
        code: "lead_persist_failed",
      },
      { status: 500 },
    );
  }
}
