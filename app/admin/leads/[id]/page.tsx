import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LeadEditForm } from "@/components/admin/LeadEditForm";
import { requireAdmin } from "@/lib/auth/current-user";
import { isDatabaseConfigured } from "@/lib/db/client";
import { LEAD_STATUS_LABEL_RU, normalizeLeadStatus } from "@/lib/leads/lead-status-public";
import { getLeadById } from "@/lib/services/leads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function badgeVariantForStatus(status: ReturnType<typeof normalizeLeadStatus>) {
  if (status === "new") return "default" as const;
  if (status === "in_progress") return "secondary" as const;
  if (status === "spam") return "destructive" as const;
  return "outline" as const;
}

function formatAttribution(value: unknown): string {
  if (value && typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }
  return String(value ?? "{}");
}

export default async function AdminLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin("/admin/leads");
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isFinite(id) || id <= 0) notFound();

  if (!isDatabaseConfigured()) {
    return (
      <p className="text-sm text-muted-foreground">
        База данных не настроена.
      </p>
    );
  }

  const lead = await getLeadById(id);
  if (!lead) notFound();

  const displayStatus = normalizeLeadStatus(lead.status);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="-ml-2 h-8 px-2">
              <Link href="/admin/leads">← К списку</Link>
            </Button>
            <h1 className="text-xl font-semibold tracking-tight">Заявка #{lead.id}</h1>
            <Badge variant={badgeVariantForStatus(displayStatus)}>
              {LEAD_STATUS_LABEL_RU[displayStatus]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Создана {new Date(lead.createdAt).toLocaleString("ru-RU")}
          </p>
        </div>
      </div>

      <section className="rounded-xl border border-border bg-background p-4 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Контакты
        </h2>
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted-foreground">Имя / организация</dt>
            <dd className="font-medium">{lead.name}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Телефон</dt>
            <dd className="tabular-nums font-medium">{lead.phone}</dd>
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
            <dd>{lead.source || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Страница</dt>
            <dd className="break-all">{lead.page || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Товар</dt>
            <dd>{lead.productName || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Slug товара</dt>
            <dd className="break-all">
              {lead.productSlug ? (
                <Link className="text-primary hover:underline" href={`/catalog/${lead.productSlug}`}>
                  {lead.productSlug}
                </Link>
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
        <pre className="max-h-64 overflow-auto rounded-md bg-muted/50 p-3 text-xs leading-relaxed">
          {formatAttribution(lead.attribution)}
        </pre>
      </section>

      <section className="rounded-xl border border-border bg-background p-4 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Telegram
        </h2>
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted-foreground">Доставлено</dt>
            <dd>
              {lead.telegramDelivered ? (
                <Badge variant="secondary">Да</Badge>
              ) : (
                <Badge variant="outline">Нет</Badge>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Message ID</dt>
            <dd className="tabular-nums break-all">{lead.telegramMessageId || "—"}</dd>
          </div>
          {lead.telegramError ? (
            <div className="sm:col-span-2">
              <dt className="text-xs text-muted-foreground">Ошибка</dt>
              <dd className="text-destructive break-all text-sm">{lead.telegramError}</dd>
            </div>
          ) : null}
        </dl>
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
            <dt className="text-xs text-muted-foreground">Создана (UTC)</dt>
            <dd className="tabular-nums text-xs">{lead.createdAt.toISOString()}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Обновлена (UTC)</dt>
            <dd className="tabular-nums text-xs">{lead.updatedAt.toISOString()}</dd>
          </div>
        </dl>
      </section>

      <Separator />

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Обработка
        </h2>
        <LeadEditForm lead={lead} />
      </div>
    </div>
  );
}
