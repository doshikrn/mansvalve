import Link from "next/link";
import { ArrowRight, FileText, ImagePlus, Inbox, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth/current-user";
import { isDatabaseConfigured } from "@/lib/db/client";
import { LEAD_STATUS_LABEL_RU, normalizeLeadStatus } from "@/lib/leads/lead-status-public";
import { countCategories } from "@/lib/services/categories";
import { listLeads } from "@/lib/services/leads";
import { countMediaAssets } from "@/lib/services/media";
import { countProducts } from "@/lib/services/products";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await requireAdmin("/admin");

  if (!isDatabaseConfigured()) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-6 text-center">
          <h1 className="text-lg font-semibold text-amber-950">База данных не подключена</h1>
          <p className="mt-2 text-sm leading-relaxed text-amber-900/90">
            Чтобы работали заявки, каталог и редактирование контента, добавьте{" "}
            <code className="rounded bg-white/80 px-1 text-xs">DATABASE_URL</code> в{" "}
            <code className="rounded bg-white/80 px-1 text-xs">.env.local</code>, выполните миграции и при необходимости
            создайте администратора.
          </p>
          <p className="mt-3 text-xs text-amber-800/80">
            Команды: <code className="rounded bg-white/60 px-1">npm run db:migrate</code> ·{" "}
            <code className="rounded bg-white/60 px-1">npm run admin:create</code>
          </p>
        </div>
        <p className="text-center text-sm text-slate-500">
          Здравствуйте, {session.name || session.email}
        </p>
      </div>
    );
  }

  const [products, categories, mediaCount, newLeads, recentLeads] = await Promise.all([
    countProducts(),
    countCategories(),
    countMediaAssets(),
    listLeads({ status: "new", page: 1, pageSize: 1 }).then((r) => r.total),
    listLeads({ page: 1, pageSize: 5 }),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Добро пожаловать, {session.name || session.email}
        </h1>
        <p className="mt-1 text-sm text-slate-600">Краткая сводка и быстрые действия</p>
      </header>

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Сводка</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Новые заявки"
            value={newLeads}
            href="/admin/leads?status=new"
            accent="border-l-4 border-l-[#1D4ED8]"
          />
          <StatCard label="Товары в каталоге" value={products} href="/admin/products" />
          <StatCard label="Категории" value={categories} href="/admin/categories" />
          <StatCard label="Файлы в медиатеке" value={mediaCount} href="/admin/media" />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Быстрые действия</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAction href="/admin/products/new" icon={Plus} label="Добавить товар" />
          <QuickAction href="/admin/leads" icon={Inbox} label="Открыть заявки" />
          <QuickAction href="/admin/content" icon={FileText} label="Тексты главной страницы" />
          <QuickAction href="/admin/media" icon={ImagePlus} label="Загрузить изображение" />
        </div>
      </section>

      <section className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-slate-900">Последние заявки</h2>
          <Link
            href="/admin/leads"
            className="inline-flex items-center gap-1 text-sm font-medium text-[#1D4ED8] hover:underline"
          >
            Все заявки
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {recentLeads.items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#E2E8F0] bg-[#F8FAFC] px-4 py-10 text-center">
            <Inbox className="mx-auto h-10 w-10 text-slate-300" aria-hidden />
            <p className="mt-3 text-sm font-medium text-slate-700">Пока нет заявок</p>
            <p className="mt-1 text-sm text-slate-500">Когда клиент отправит форму на сайте, она появится здесь.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-[#E2E8F0]">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-slate-50/80 text-left text-xs font-medium text-slate-500">
                  <th className="px-4 py-2.5">Дата</th>
                  <th className="px-4 py-2.5">Клиент</th>
                  <th className="px-4 py-2.5">Телефон</th>
                  <th className="px-4 py-2.5">Статус</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.items.map((lead) => {
                  const st = normalizeLeadStatus(lead.status);
                  return (
                    <tr
                      key={lead.id}
                      className="border-b border-[#E2E8F0] transition-colors last:border-0 hover:bg-slate-50/90"
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-xs tabular-nums text-slate-500">
                        {new Date(lead.createdAt).toLocaleString("ru-RU", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        <Link href={`/admin/leads/${lead.id}`} className="hover:text-[#1D4ED8] hover:underline">
                          {lead.name}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 tabular-nums text-slate-600">{lead.phone}</td>
                      <td className="px-4 py-3">
                        <Badge variant={st === "new" ? "default" : "secondary"} className="font-normal">
                          {LEAD_STATUS_LABEL_RU[st]}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
  accent = "",
}: {
  label: string;
  value: number;
  href: string;
  accent?: string;
}) {
  return (
    <Link
      href={href}
      className={`group flex flex-col rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm transition hover:border-[#1D4ED8]/30 hover:shadow-md ${accent}`}
    >
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <span className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-slate-900">{value}</span>
      <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#1D4ED8] opacity-0 transition group-hover:opacity-100">
        Подробнее <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
}

function QuickAction({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-sm transition hover:border-[#1D4ED8]/35 hover:bg-blue-50/50"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1D4ED8]/10 text-[#1D4ED8]">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      {label}
    </Link>
  );
}
