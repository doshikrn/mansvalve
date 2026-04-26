import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth/current-user";
import { isDatabaseConfigured } from "@/lib/db/client";
import { countCategories } from "@/lib/services/categories";
import { countLeads } from "@/lib/services/leads";
import { countProducts } from "@/lib/services/products";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await requireAdmin("/admin");

  if (!isDatabaseConfigured()) {
    return (
      <div className="max-w-2xl space-y-3">
        <h1 className="text-xl font-semibold tracking-tight">Добро пожаловать</h1>
        <p className="text-sm text-muted-foreground">
          База данных не настроена. Задайте <code>DATABASE_URL</code> в{" "}
          <code>.env.local</code>, примените миграции
          (<code>npm run db:migrate</code>) и создайте администратора
          (<code>npm run admin:create</code>).
        </p>
      </div>
    );
  }

  const [products, categories, newLeads, totalLeads] = await Promise.all([
    countProducts(),
    countCategories(),
    countLeads("new"),
    countLeads(),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold tracking-tight">
          Привет, {session.name || session.email}
        </h1>
        <p className="text-sm text-muted-foreground">
          Сводка по каталогу и заявкам.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Товары" value={products} href="/admin/products" />
        <StatCard label="Категории" value={categories} href="/admin/categories" />
        <StatCard label="Заявок всего" value={totalLeads} href="/admin/leads" />
        <StatCard label="Новых заявок" value={newLeads} href="/admin/leads?status=new" />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Следующие шаги</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            Фундамент админки готов. Из этого экрана можно начать работу с
            товарами, позже подключим категории, медиа и редактирование
            контента.
          </p>
          <p>
            Заявки с сайта автоматически сохраняются в БД параллельно с
            отправкой в Telegram.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-xl border border-border bg-background p-4 transition hover:border-foreground/20 hover:shadow-sm"
    >
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
    </Link>
  );
}
