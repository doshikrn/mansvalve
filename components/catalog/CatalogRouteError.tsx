import Link from "next/link";

import { Button } from "@/components/ui/button";

type CatalogRouteErrorProps = {
  route?: string;
  showRetry?: boolean;
  onRetry?: () => void;
};

/**
 * Production-safe catalog fallback (matches public site chrome, no admin styling).
 */
export function CatalogRouteError({
  route,
  showRetry = false,
  onRetry,
}: CatalogRouteErrorProps) {
  return (
    <div className="min-h-screen bg-site-bg">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="rounded-2xl border border-site-border bg-site-card p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Каталог временно недоступен
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
            Не удалось загрузить данные каталога. Попробуйте обновить страницу через несколько
            секунд или перейдите в другой раздел сайта.
          </p>
          {route ? (
            <p className="mt-2 text-xs text-slate-500">
              Маршрут: <span className="font-mono">{route}</span>
            </p>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-2">
            {showRetry && onRetry ? (
              <Button type="button" size="sm" onClick={onRetry}>
                Повторить
              </Button>
            ) : null}
            <Button type="button" size="sm" variant="outline" asChild>
              <Link href="/catalog">Открыть каталог</Link>
            </Button>
            <Button type="button" size="sm" variant="outline" asChild>
              <Link href="/contacts">Связаться с нами</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
