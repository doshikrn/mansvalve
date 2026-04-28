import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth/current-user";
import { isDatabaseConfigured } from "@/lib/db/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdmin("/admin/settings");
  const dbOk = isDatabaseConfigured();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">Настройки</h1>
        <p className="mt-1 text-sm text-slate-600">
          Справочная информация об окружении. Критичные параметры по-прежнему задаются в{" "}
          <code className="rounded bg-slate-100 px-1 text-xs">.env.local</code> на сервере.
        </p>
      </header>

      <Card className="border-[#E2E8F0] bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">База данных</CardTitle>
          <CardDescription>Состояние подключения для каталога, заявок и контента.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-600">
          <p>
            Статус:{" "}
            <span className={dbOk ? "font-medium text-emerald-700" : "font-medium text-amber-700"}>
              {dbOk ? "подключена" : "не настроена"}
            </span>
          </p>
          {!dbOk ? (
            <p>
              Укажите <code className="rounded bg-slate-100 px-1 text-xs">DATABASE_URL</code>, выполните{" "}
              <code className="rounded bg-slate-100 px-1 text-xs">npm run db:migrate</code> и при необходимости{" "}
              <code className="rounded bg-slate-100 px-1 text-xs">npm run admin:create</code>.
            </p>
          ) : (
            <p>Заявки, товары и редактируемый контент сохраняются в Postgres.</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-[#E2E8F0] bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Уведомления и медиа</CardTitle>
          <CardDescription>Интеграции настраиваются переменными окружения на хостинге.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-600">
          <p>
            Telegram-бот для заявок: переменные из документации проекта (токен и chat id). Без них заявки всё равно
            сохраняются в базу.
          </p>
          <p>
            Медиафайлы: драйвер задаётся через <code className="rounded bg-slate-100 px-1 text-xs">MEDIA_DRIVER</code>{" "}
            (локально или облако).
          </p>
        </CardContent>
      </Card>

      <Card className="border-[#E2E8F0] bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Быстрые ссылки</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 text-sm">
          <Link href="/admin/content" className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 font-medium text-[#1D4ED8] hover:bg-slate-50">
            Контент сайта
          </Link>
          <Link href="/admin/media" className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 font-medium text-[#1D4ED8] hover:bg-slate-50">
            Медиа
          </Link>
          <Link href="/" target="_blank" rel="noopener noreferrer" className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 font-medium text-[#1D4ED8] hover:bg-slate-50">
            Публичный сайт
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
