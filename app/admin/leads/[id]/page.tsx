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

const ATTRIBUTION_LABELS: Record<string, string> = {
  utm_source: "UTM source",
  utm_medium: "UTM medium",
  utm_campaign: "UTM campaign",
  utm_term: "UTM term",
  utm_content: "UTM content",
  gclid: "Google Click ID",
  yclid: "Yandex Click ID",
  fbclid: "Facebook Click ID",
  referrer: "Referrer",
  first_utm_source: "First UTM source",
  first_utm_medium: "First UTM medium",
  first_utm_campaign: "First UTM campaign",
  first_utm_term: "First UTM term",
  first_utm_content: "First UTM content",
  first_gclid: "First Google Click ID",
  first_yclid: "First Yandex Click ID",
  first_fbclid: "First Facebook Click ID",
  first_referrer: "First referrer",
  first_landing_path: "First landing path",
  first_touch_at: "First touch",
};

function displayValue(value: string | number | null | undefined): string {
  if (value == null) return "—";
  const text = String(value).trim();
  return text || "—";
}

function getFilledAttributionEntries(value: unknown): Array<[string, string]> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];

  return Object.entries(value as Record<string, unknown>)
    .filter(([, rawValue]) => {
      if (rawValue == null) return false;
      if (typeof rawValue === "string") return rawValue.trim().length > 0;
      return true;
    })
    .map(([key, rawValue]) => [
      ATTRIBUTION_LABELS[key] ?? key,
      typeof rawValue === "string" ? rawValue.trim() : JSON.stringify(rawValue),
    ]);
}

function formatTechnicalJson(value: unknown): string {
  if (value && typeof value === "object") {
    const filledEntries = Object.entries(value as Record<string, unknown>).filter(([, rawValue]) => {
      if (rawValue == null) return false;
      if (typeof rawValue === "string") return rawValue.trim().length > 0;
      return true;
    });

    return JSON.stringify(Object.fromEntries(filledEntries), null, 2);
  }
  return "{}";
}

function hasTechnicalJson(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  return Object.values(value as Record<string, unknown>).some((rawValue) => {
    if (rawValue == null) return false;
    if (typeof rawValue === "string") return rawValue.trim().length > 0;
    return true;
  });
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
  const attributionEntries = getFilledAttributionEntries(lead.attribution);
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
          Атрибуция (UTM и first-touch)
        </h2>
        {attributionEntries.length > 0 ? (
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            {attributionEntries.map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="break-all">{value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-sm text-muted-foreground">UTM-метки не зафиксированы.</p>
        )}
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
