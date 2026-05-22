"use client";

import { useEffect } from "react";
import Link from "next/link";

import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { Button } from "@/components/ui/button";

export default function CatalogHealthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin/catalog-health]", error);
  }, [error]);

  return (
    <div className="space-y-5">
      <AdminBreadcrumbs items={[{ label: "Проверка каталога" }]} />
      <div className="rounded-xl border border-red-200 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-semibold text-red-900">Не удалось загрузить отчёт</h1>
        <p className="mt-2 text-sm text-slate-600">
          Проверьте подключение к базе данных и попробуйте снова. Если ошибка
          повторяется, откройте консоль браузера (F12) и передайте текст ошибки
          разработчику.
        </p>
        {process.env.NODE_ENV === "development" ? (
          <pre className="mt-4 max-h-40 overflow-auto rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
            {error.message}
          </pre>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" size="sm" onClick={() => reset()}>
            Повторить
          </Button>
          <Button type="button" size="sm" variant="outline" asChild>
            <Link href="/admin">На главную админки</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
