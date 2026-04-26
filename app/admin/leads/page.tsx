import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/current-user";
import { isDatabaseConfigured } from "@/lib/db/client";
import { leadStatusValues, type LeadStatus } from "@/lib/db/schema";
import { LEAD_STATUS_LABEL_RU, normalizeLeadStatus } from "@/lib/leads/lead-status-public";
import { listLeadSourceOptions, listLeads } from "@/lib/services/leads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

function isLeadStatus(value: string | undefined): value is LeadStatus {
  return Boolean(value && (leadStatusValues as readonly string[]).includes(value));
}

function badgeVariantForStatus(status: LeadStatus) {
  if (status === "new") return "default" as const;
  if (status === "in_progress") return "secondary" as const;
  if (status === "spam") return "destructive" as const;
  return "outline" as const;
}

function buildListHref(params: {
  status?: LeadStatus;
  source?: string;
  from?: string;
  to?: string;
  q?: string;
  page?: number;
}): string {
  const sp = new URLSearchParams();
  if (params.status) sp.set("status", params.status);
  if (params.source && params.source !== "__all__") sp.set("source", params.source);
  if (params.from?.trim()) sp.set("from", params.from.trim());
  if (params.to?.trim()) sp.set("to", params.to.trim());
  if (params.q?.trim()) sp.set("q", params.q.trim());
  if (params.page && params.page > 1) sp.set("page", String(params.page));
  const qs = sp.toString();
  return qs ? `/admin/leads?${qs}` : "/admin/leads";
}

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    source?: string;
    from?: string;
    to?: string;
    q?: string;
    page?: string;
  }>;
}) {
  await requireAdmin("/admin/leads");
  const params = await searchParams;

  if (!isDatabaseConfigured()) {
    return (
      <p className="text-sm text-muted-foreground">
        База данных не настроена. После настройки заявки будут автоматически
        попадать в этот список.
      </p>
    );
  }

  const status = isLeadStatus(params.status) ? params.status : undefined;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const source = params.source?.trim() || undefined;
  const dateFrom = params.from?.trim() || undefined;
  const dateTo = params.to?.trim() || undefined;
  const q = params.q?.trim() || undefined;

  const [{ items, total }, sourceOptions] = await Promise.all([
    listLeads({ status, source, dateFrom, dateTo, q, page, pageSize: PAGE_SIZE }),
    listLeadSourceOptions(),
  ]);

  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentFilters = { status, source, from: dateFrom, to: dateTo, q };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Заявки</h1>
          <p className="text-sm text-muted-foreground">
            Всего по фильтру: {total}. Откройте строку для деталей и заметок.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/leads">Сбросить фильтры</Link>
        </Button>
      </header>

      <form
        method="get"
        className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4 sm:flex-row sm:flex-wrap sm:items-end"
      >
        <div className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-6 sm:max-w-none">
          <label className="flex min-w-[140px] flex-col gap-1 text-xs font-medium text-muted-foreground">
            Статус
            <select
              name="status"
              defaultValue={status ?? ""}
              className="h-9 rounded-md border border-input bg-background px-2 text-sm"
            >
              <option value="">Все</option>
              {leadStatusValues.map((s) => (
                <option key={s} value={s}>
                  {LEAD_STATUS_LABEL_RU[s]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-[160px] flex-col gap-1 text-xs font-medium text-muted-foreground">
            Источник
            <select
              name="source"
              defaultValue={source ?? ""}
              className="h-9 rounded-md border border-input bg-background px-2 text-sm"
            >
              <option value="">Все</option>
              {sourceOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-[140px] flex-col gap-1 text-xs font-medium text-muted-foreground">
            С даты
            <input
              type="date"
              name="from"
              defaultValue={dateFrom ?? ""}
              className="h-9 rounded-md border border-input bg-background px-2 text-sm"
            />
          </label>
          <label className="flex min-w-[140px] flex-col gap-1 text-xs font-medium text-muted-foreground">
            По дату
            <input
              type="date"
              name="to"
              defaultValue={dateTo ?? ""}
              className="h-9 rounded-md border border-input bg-background px-2 text-sm"
            />
          </label>
          <label className="flex min-w-[200px] flex-col gap-1 text-xs font-medium text-muted-foreground sm:col-span-2 lg:col-span-2">
            Поиск (имя / телефон / комментарий)
            <input
              type="search"
              name="q"
              placeholder="Например, +7 или название"
              defaultValue={q ?? ""}
              className="h-9 rounded-md border border-input bg-background px-2 text-sm"
            />
          </label>
        </div>
        <Button type="submit" size="sm" className="shrink-0 sm:ml-auto">
          Применить
        </Button>
      </form>

      <div className="flex flex-wrap gap-2 text-xs">
        <span className="text-muted-foreground">Быстро:</span>
        {leadStatusValues.map((s) => (
          <Link
            key={s}
            href={buildListHref({ ...currentFilters, status: s, page: 1 })}
            className="rounded-full border border-border px-2.5 py-0.5 font-medium text-muted-foreground transition hover:border-foreground/30 hover:text-foreground"
          >
            {LEAD_STATUS_LABEL_RU[s]}
          </Link>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-background">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2 font-medium">Создана</th>
                <th className="px-4 py-2 font-medium">Имя</th>
                <th className="px-4 py-2 font-medium">Телефон</th>
                <th className="px-4 py-2 font-medium">Контекст</th>
                <th className="px-4 py-2 font-medium">Источник</th>
                <th className="px-4 py-2 font-medium">Telegram</th>
                <th className="px-4 py-2 font-medium">Статус</th>
                <th className="px-4 py-2 w-10" />
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                    Заявок по фильтру нет.
                  </td>
                </tr>
              ) : (
                items.map((lead) => {
                  const displayStatus = normalizeLeadStatus(lead.status);
                  return (
                    <tr key={lead.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-2 text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                        {new Date(lead.createdAt).toLocaleString("ru-RU")}
                      </td>
                      <td className="px-4 py-2 font-medium">
                        <Link
                          href={`/admin/leads/${lead.id}`}
                          className="text-foreground hover:text-primary hover:underline"
                        >
                          {lead.name}
                        </Link>
                      </td>
                      <td className="px-4 py-2 tabular-nums whitespace-nowrap">{lead.phone}</td>
                      <td className="max-w-[220px] px-4 py-2 text-xs text-muted-foreground">
                        <div className="truncate" title={lead.productName || lead.page || ""}>
                          {lead.productName || lead.page || "—"}
                        </div>
                        {lead.comment ? (
                          <div className="truncate text-[11px] text-muted-foreground/80" title={lead.comment}>
                            {lead.comment}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-2 text-xs text-muted-foreground whitespace-nowrap">
                        {lead.source || "—"}
                      </td>
                      <td className="px-4 py-2">
                        {lead.telegramDelivered ? (
                          <Badge variant="secondary">ok</Badge>
                        ) : lead.telegramError ? (
                          <Badge variant="destructive" title={lead.telegramError}>
                            ошибка
                          </Badge>
                        ) : (
                          <Badge variant="outline">—</Badge>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <Badge variant={badgeVariantForStatus(displayStatus)}>
                          {LEAD_STATUS_LABEL_RU[displayStatus]}
                        </Badge>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <Button asChild variant="ghost" size="sm" className="h-8 px-2">
                          <Link href={`/admin/leads/${lead.id}`}>→</Link>
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {lastPage > 1 ? (
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-muted-foreground">
            Стр. {page} из {lastPage}
          </span>
          <div className="flex gap-2">
            {page > 1 ? (
              <Button asChild variant="outline" size="sm">
                <Link
                  href={buildListHref({
                    ...currentFilters,
                    page: page - 1,
                  })}
                >
                  Назад
                </Link>
              </Button>
            ) : null}
            {page < lastPage ? (
              <Button asChild variant="outline" size="sm">
                <Link
                  href={buildListHref({
                    ...currentFilters,
                    page: page + 1,
                  })}
                >
                  Вперёд
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
