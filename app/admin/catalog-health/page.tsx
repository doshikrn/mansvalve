import Link from "next/link";

import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { AdminInlineNotice, AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/current-user";
import { PublicCatalogSourceNotice } from "@/components/admin/PublicCatalogSourceNotice";
import { getCatalogHealthPageModel } from "@/lib/catalog/health";
import { getPublicCatalogRuntimeInfo } from "@/lib/public-catalog";
import { isDatabaseConfigured } from "@/lib/db/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function productsHrefForMetric(samples: { productSlug?: string }[]): string {
  const slug = samples.find((s) => s.productSlug?.trim())?.productSlug?.trim();
  return slug
    ? `/admin/products?q=${encodeURIComponent(slug)}`
    : "/admin/products";
}

export default async function CatalogHealthPage() {
  await requireAdmin("/admin/catalog-health");

  if (!isDatabaseConfigured()) {
    return (
      <div className="space-y-4">
        <AdminBreadcrumbs items={[{ label: "Проверка каталога" }]} />
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950">
          <p className="font-medium">Проверка пока недоступна</p>
          <p className="mt-2 text-amber-900/90">
            Каталог в админке подключается после настройки окружения на сервере. Обратитесь к
            разработчику — он включит нужные параметры и проверку можно будет открыть снова.
          </p>
        </div>
      </div>
    );
  }

  const runtime = getPublicCatalogRuntimeInfo();
  const { headline, metrics } = await getCatalogHealthPageModel();

  const attentionCount = metrics.filter((row) => {
    if (row.kind !== "ok") return false;
    const { metric } = row;
    if (metric.count === 0) return false;
    return metric.severity === "critical" || metric.severity === "warn";
  }).length;

  return (
    <div className="space-y-5">
      <AdminBreadcrumbs items={[{ label: "Проверка каталога" }]} />

      <PublicCatalogSourceNotice />

      {!runtime.adminChangesVisibleOnPublicSite ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-950">
          <p className="font-semibold">Публичный сайт не читает эту базу данных</p>
          <p className="mt-1">
            Пока источник каталога не переключён на DB, правки в админке могут не попадать на
            сайт. configuredSource={runtime.configuredSource}, effectiveSource=
            {runtime.effectiveSource}.
          </p>
        </div>
      ) : null}

      <header className="space-y-3">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">
          Проверка каталога
        </h1>
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm leading-relaxed text-slate-700 shadow-sm">
          <p>
            Ниже — простые карточки: что стоит доделать по товарам. Цифры считаются при открытии
            страницы. Ничего здесь не блокирует сохранение — это подсказки для менеджера.
          </p>
          <p className="mt-2 text-slate-600">
            Если одна карточка не открылась, остальные всё равно можно смотреть: сбой одной
            проверки не отменяет остальные.
          </p>
        </div>

        {headline.summaryUnavailable ? (
          <AdminInlineNotice tone="auto">
            Общие цифры в шапке сейчас не подгрузились. Карточки ниже по возможности всё равно
            показаны — ориентируйтесь на них.
          </AdminInlineNotice>
        ) : null}

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <AdminStatusBadge tone="readonly">
            {headline.totalProducts} товаров в каталоге
          </AdminStatusBadge>
          <AdminStatusBadge tone="auto">
            {headline.inactiveProducts} скрыто на сайте
          </AdminStatusBadge>
          <AdminStatusBadge tone="readonly">
            {headline.totalAliases} переходов со старых адресов
          </AdminStatusBadge>
          {attentionCount > 0 ? (
            <AdminStatusBadge tone="manual">
              {attentionCount}{" "}
              {attentionCount === 1 ? "тема требует внимания" : "тем требуют внимания"}
            </AdminStatusBadge>
          ) : null}
        </div>
        <p className="text-xs text-slate-400">
          Обновлено: {new Date(headline.generatedAt).toLocaleString("ru-RU")}.
        </p>
      </header>

      {attentionCount === 0 ? (
        <AdminInlineNotice tone="manual">
          Серьёзных замечаний по списку ниже нет. Всё равно загляните в карточки — там могут быть
          мягкие подсказки (например, только автоматическое название).
        </AdminInlineNotice>
      ) : (
        <AdminInlineNotice tone="auto">
          Есть темы, которые лучше поправить в первую очередь — они отмечены цветом счётчика в
          карточке.
        </AdminInlineNotice>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {metrics.map((row, index) => {
          if (row.kind === "failed") {
            return (
              <section
                key={`failed-${row.title}-${index}`}
                className="overflow-hidden rounded-xl border border-amber-200 bg-amber-50/80 shadow-sm"
              >
                <header className="border-b border-amber-200 px-4 py-3">
                  <h2 className="text-sm font-semibold text-amber-950">{row.title}</h2>
                </header>
                <div className="px-4 py-3 text-sm text-amber-950">{row.message}</div>
              </section>
            );
          }

          const { metric, hint } = row;
          const toneClass =
            metric.count === 0
              ? "bg-emerald-50 text-emerald-800"
              : metric.severity === "critical"
                ? "bg-red-50 text-red-800"
                : metric.severity === "warn"
                  ? "bg-amber-50 text-amber-900"
                  : "bg-slate-100 text-slate-700";

          return (
            <section
              key={metric.id}
              className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm"
            >
              <header className="flex flex-wrap items-start justify-between gap-2 border-b border-[#E2E8F0] px-4 py-3">
                <div className="min-w-0 space-y-1">
                  <h2 className="text-sm font-semibold text-slate-900">{metric.label}</h2>
                  <p className="text-xs text-slate-600">{hint}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-sm font-semibold tabular-nums ${toneClass}`}
                >
                  {metric.count}
                </span>
              </header>
              <div className="space-y-3 px-4 py-3">
                {metric.count === 0 ? (
                  <p className="text-xs text-emerald-800">Проблем не найдено.</p>
                ) : metric.samples.length === 0 ? (
                  <p className="text-xs text-slate-600">
                    Найдено {metric.count} — список примеров в этом окне не показан.
                  </p>
                ) : (
                  <ul className="space-y-1.5 text-xs">
                    {metric.samples.map((sample, i) => (
                      <li
                        key={`${metric.id}-${sample.productSlug ?? i}-${i}`}
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
                            {sample.productName || sample.detail || "—"}
                          </span>
                        )}
                        {sample.detail && sample.productSlug ? (
                          <span className="text-slate-500">· {sample.detail}</span>
                        ) : sample.detail ? (
                          <span className="text-slate-500">{sample.detail}</span>
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

                {metric.count > 0 && metric.samples.some((s) => s.productSlug) ? (
                  <Button asChild size="sm" variant="outline">
                    <Link href={productsHrefForMetric(metric.samples)}>Открыть товары</Link>
                  </Button>
                ) : null}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
