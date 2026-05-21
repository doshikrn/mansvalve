import Link from "next/link";

import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { AdminInlineNotice, AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { requireAdmin } from "@/lib/auth/current-user";
import {
  getCatalogHealthReport,
  type HealthMetric,
} from "@/lib/catalog/health";
import { isDatabaseConfigured } from "@/lib/db/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SEVERITY_TONE: Record<HealthMetric["severity"], "auto" | "manual" | "readonly" | "generated"> = {
  info: "readonly",
  warn: "auto",
  critical: "manual",
};

const SEVERITY_LABEL: Record<HealthMetric["severity"], string> = {
  info: "INFO",
  warn: "WARN",
  critical: "CRITICAL",
};

export default async function CatalogHealthPage() {
  await requireAdmin("/admin/catalog-health");

  if (!isDatabaseConfigured()) {
    return (
      <p className="text-sm text-muted-foreground">
        База данных не настроена. Запустите миграции.
      </p>
    );
  }

  const report = await getCatalogHealthReport();
  const criticalCount = report.metrics.filter(
    (m) => m.severity === "critical" && m.count > 0,
  ).length;
  const warnCount = report.metrics.filter(
    (m) => m.severity === "warn" && m.count > 0,
  ).length;

  return (
    <div className="space-y-5">
      <AdminBreadcrumbs items={[{ label: "Здоровье каталога" }]} />

      <header className="space-y-2">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">
          Здоровье каталога
        </h1>
        <p className="text-sm text-slate-600">
          Server-side аудит SKU и SEO-консистентности. Запускается по запросу
          (force-dynamic), не влияет на ISR публичного сайта.
        </p>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <AdminStatusBadge tone="readonly">
            {report.totalProducts} товаров
          </AdminStatusBadge>
          <AdminStatusBadge tone="auto">
            {report.inactiveProducts} скрыты
          </AdminStatusBadge>
          <AdminStatusBadge tone="readonly">
            {report.totalAliases} slug-алиасов
          </AdminStatusBadge>
          {criticalCount > 0 ? (
            <AdminStatusBadge tone="manual">
              {criticalCount} critical
            </AdminStatusBadge>
          ) : null}
          {warnCount > 0 ? (
            <AdminStatusBadge tone="auto">{warnCount} warn</AdminStatusBadge>
          ) : null}
        </div>
        <p className="text-xs text-slate-400">
          Снимок от {new Date(report.generatedAt).toLocaleString("ru-RU")}.
        </p>
      </header>

      {criticalCount === 0 && warnCount === 0 ? (
        <AdminInlineNotice tone="manual">
          Критичных и предупреждающих проблем не найдено. Информационные метрики
          (drift, fallback) показаны ниже для общей картины.
        </AdminInlineNotice>
      ) : (
        <AdminInlineNotice tone="auto">
          Это soft-аудит. Метрики не блокируют публикации, но дают понятный
          список SKU, которые стоит дополнить или поправить.
        </AdminInlineNotice>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {report.metrics.map((metric) => (
          <section
            key={metric.id}
            className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm"
          >
            <header className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] px-4 py-3">
              <div className="space-y-1">
                <h2 className="text-sm font-semibold text-slate-900">
                  {metric.label}
                </h2>
                <p className="text-xs text-slate-500">id: <code>{metric.id}</code></p>
              </div>
              <div className="flex items-center gap-2">
                <AdminStatusBadge tone={SEVERITY_TONE[metric.severity]}>
                  {SEVERITY_LABEL[metric.severity]}
                </AdminStatusBadge>
                <span
                  className={
                    "rounded-full px-2.5 py-0.5 text-sm font-semibold tabular-nums " +
                    (metric.count === 0
                      ? "bg-emerald-50 text-emerald-700"
                      : metric.severity === "critical"
                        ? "bg-red-50 text-red-700"
                        : metric.severity === "warn"
                          ? "bg-amber-50 text-amber-800"
                          : "bg-slate-100 text-slate-700")
                  }
                >
                  {metric.count}
                </span>
              </div>
            </header>
            <div className="px-4 py-3">
              {metric.count === 0 ? (
                <p className="text-xs text-emerald-700">Чисто.</p>
              ) : metric.samples.length === 0 ? (
                <p className="text-xs text-slate-500">
                  Найдено {metric.count}, но без подробностей в этом срезе.
                </p>
              ) : (
                <ul className="space-y-1.5 text-xs">
                  {metric.samples.map((sample, index) => (
                    <li
                      key={`${metric.id}-${index}`}
                      className="flex flex-wrap items-baseline gap-2"
                    >
                      {sample.productSlug ? (
                        <Link
                          href={`/admin/products?q=${encodeURIComponent(sample.productSlug)}`}
                          className="font-medium text-site-primary hover:underline"
                        >
                          {sample.productName || sample.productSlug}
                        </Link>
                      ) : (
                        <span className="font-medium text-slate-700">
                          {sample.productName || "—"}
                        </span>
                      )}
                      {sample.detail ? (
                        <span className="text-slate-500">· {sample.detail}</span>
                      ) : null}
                    </li>
                  ))}
                  {metric.count > metric.samples.length ? (
                    <li className="text-slate-400">
                      … и ещё {metric.count - metric.samples.length}
                    </li>
                  ) : null}
                </ul>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
