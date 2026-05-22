import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LeadEditForm } from "@/components/admin/LeadEditForm";
import { formatAlmatyDateTime } from "@/lib/admin/date-format";
import { safeReturnTo } from "@/lib/admin/safe-return-to";
import { requireAdmin } from "@/lib/auth/current-user";
import { isDatabaseConfigured } from "@/lib/db/client";
import { LEAD_STATUS_LABEL_RU, normalizeLeadStatus } from "@/lib/leads/lead-status-public";
import { getPublicProductBySlug } from "@/lib/public-catalog";
import { buildPublicProductView } from "@/lib/public-catalog/product-view";
import { getLeadById } from "@/lib/services/leads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function badgeVariantForStatus(status: ReturnType<typeof normalizeLeadStatus>) {
  if (status === "new") return "default" as const;
  if (status === "in_progress") return "secondary" as const;
  if (status === "spam") return "destructive" as const;
  return "outline" as const;
}

const MARKETING_ATTRIBUTION_LABELS: Record<string, string> = {
  utm_source: "UTM source",
  utm_medium: "UTM medium",
  utm_campaign: "UTM campaign",
  utm_term: "UTM term",
  utm_content: "UTM content",
  gclid: "Google Click ID",
  yclid: "Yandex Click ID",
  fbclid: "Facebook Click ID",
};

const INTERNAL_REFERRER_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "chatgpt.com",
  "www.chatgpt.com",
  "mansvalve.kz",
  "www.mansvalve.kz",
  "mansvalve-group.kz",
  "www.mansvalve-group.kz",
]);

function displayValue(value: string | number | null | undefined): string {
  if (value == null) return "—";
  const text = String(value).trim();
  return text || "—";
}

function getAttributionRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function getStringField(record: Record<string, unknown>, key: string): string | null {
  const value = record[key];
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text || null;
}

function getMarketingAttributionEntries(record: Record<string, unknown>): Array<[string, string]> {
  return Object.entries(MARKETING_ATTRIBUTION_LABELS).flatMap(([key, label]) => {
    const value = getStringField(record, key);
    return value ? [[label, value] as [string, string]] : [];
  });
}

function getUsefulReferrer(value: string | null): string | null {
  if (!value) return null;

  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    if (INTERNAL_REFERRER_HOSTS.has(host)) return null;
    return value;
  } catch {
    return null;
  }
}

function formatLandingPath(value: string | null): string | null {
  if (!value) return null;

  let path = value;
  try {
    path = new URL(value).pathname;
  } catch {
    path = value.split("?")[0] || value;
  }

  if (path === "/") return "Главная";
  if (path.startsWith("/catalog")) return "Каталог";
  return path;
}

function formatTechnicalJson(value: unknown): string {
  const record = getAttributionRecord(value);
  const filledEntries = Object.entries(record).flatMap(([key, rawValue]) => {
    if (rawValue == null) return [];
    if (typeof rawValue === "string" && rawValue.trim().length === 0) return [];

    if ((key === "referrer" || key === "first_referrer") && !getUsefulReferrer(String(rawValue))) {
      return [];
    }

    if (key === "first_touch_at") {
      return [[key, formatAlmatyDateTime(String(rawValue))] as [string, string]];
    }

    return [[key, rawValue] as [string, unknown]];
  });

  return JSON.stringify(Object.fromEntries(filledEntries), null, 2);
}

function hasTechnicalJson(value: unknown): boolean {
  return formatTechnicalJson(value) !== "{}";
}

export default async function AdminLeadDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ returnTo?: string }>;
}) {
  await requireAdmin("/admin/leads");
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isFinite(id) || id <= 0) notFound();

  const { returnTo: rawReturn } = await searchParams;
  const listHref = safeReturnTo(rawReturn, "/admin/leads");

  if (!isDatabaseConfigured()) {
    return (
      <p className="text-sm text-muted-foreground">
        База данных не настроена.
      </p>
    );
  }

  const lead = await getLeadById(id);
  if (!lead) notFound();

  const catalogProduct =
    lead.productSlug != null && lead.productSlug.trim() !== ""
      ? await getPublicProductBySlug(lead.productSlug.trim())
      : undefined;
  const catalogProductHref = catalogProduct
    ? buildPublicProductView(catalogProduct).canonicalPath
    : null;

  const displayStatus = normalizeLeadStatus(lead.status);
  const attribution = getAttributionRecord(lead.attribution);
  const marketingEntries = getMarketingAttributionEntries(attribution);
  const usefulReferrer = getUsefulReferrer(getStringField(attribution, "referrer"));
  const landingPath =
    formatLandingPath(getStringField(attribution, "landing_path")) ??
    formatLandingPath(getStringField(attribution, "first_landing_path")) ??
    formatLandingPath(lead.page);
  const hasRawAttribution = hasTechnicalJson(lead.attribution);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <AdminBreadcrumbs
        items={[
          { label: "Админка", href: "/admin" },
          { label: "Заявки", href: listHref },
          { label: `#${lead.id}` },
        ]}
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight">Заявка #{lead.id}</h1>
            <Badge variant={badgeVariantForStatus(displayStatus)}>
              {LEAD_STATUS_LABEL_RU[displayStatus]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Создана {formatAlmatyDateTime(lead.createdAt)}
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="w-full shrink-0 sm:w-auto">
          <Link href={listHref}>К списку заявок</Link>
        </Button>
      </div>

      <section className="rounded-xl border border-border bg-background p-4 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Контакты
        </h2>
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted-foreground">Имя / организация</dt>
            <dd className="font-medium">{displayValue(lead.name)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Телефон</dt>
            <dd className="tabular-nums font-medium">{displayValue(lead.phone)}</dd>
          </div>
          {lead.email ? (
            <div className="sm:col-span-2">
              <dt className="text-xs text-muted-foreground">Email</dt>
              <dd>
                <a className="text-primary hover:underline" href={`mailto:${lead.email}`}>
                  {lead.email}
                </a>
              </dd>
            </div>
          ) : null}
        </dl>
      </section>

      <section className="rounded-xl border border-border bg-background p-4 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Сообщение
        </h2>
        <p className="text-sm whitespace-pre-wrap">
          {lead.comment?.trim() ? lead.comment : "—"}
        </p>
      </section>

      <section className="rounded-xl border border-border bg-background p-4 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Контекст (товар / страница)
        </h2>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted-foreground">Источник формы</dt>
            <dd>{displayValue(lead.source)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Страница</dt>
            <dd className="break-all">{displayValue(lead.page)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Товар</dt>
            <dd>{displayValue(lead.productName)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Ссылка товара</dt>
            <dd className="break-all">
              {lead.productSlug ? (
                catalogProductHref ? (
                  <Link className="text-primary hover:underline" href={catalogProductHref}>
                    {lead.productSlug}
                  </Link>
                ) : (
                  <span>{displayValue(lead.productSlug)}</span>
                )
              ) : (
                "—"
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Категория / подкатегория</dt>
            <dd>
              {[lead.productCategory, lead.productSubcategory].filter(Boolean).join(" · ") || "—"}
            </dd>
          </div>
          {lead.productId ? (
            <div>
              <dt className="text-xs text-muted-foreground">ID товара в БД</dt>
              <dd className="tabular-nums">{lead.productId}</dd>
            </div>
          ) : null}
        </dl>
      </section>

      <section className="rounded-xl border border-border bg-background p-4 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Атрибуция
        </h2>
        {marketingEntries.length > 0 ? (
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            {marketingEntries.map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="break-all">{value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-sm text-muted-foreground">UTM-метки не зафиксированы.</p>
        )}
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted-foreground">Внешний источник</dt>
            <dd className="break-all">{usefulReferrer ?? "Внешний источник не зафиксирован"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Первая страница</dt>
            <dd className="break-all">{landingPath ?? "—"}</dd>
          </div>
        </dl>
        {hasRawAttribution ? (
          <details className="rounded-md border border-border bg-muted/30 p-3 text-xs">
            <summary className="cursor-pointer font-medium text-muted-foreground">
              Показать технический JSON
            </summary>
            <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap leading-relaxed">
              {formatTechnicalJson(lead.attribution)}
            </pre>
          </details>
        ) : null}
      </section>

      <section className="rounded-xl border border-border bg-background p-4 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Технические данные
        </h2>
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted-foreground">IP</dt>
            <dd className="break-all">{lead.ip || "—"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs text-muted-foreground">User-Agent</dt>
            <dd className="break-all font-mono text-xs text-muted-foreground">{lead.userAgent || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Создана</dt>
            <dd className="tabular-nums text-xs">{formatAlmatyDateTime(lead.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Обновлена</dt>
            <dd className="tabular-nums text-xs">{formatAlmatyDateTime(lead.updatedAt)}</dd>
          </div>
        </dl>
      </section>

      <Separator />

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Обработка
        </h2>
        <LeadEditForm lead={lead} backHref={listHref} />
      </div>
    </div>
  );
}
