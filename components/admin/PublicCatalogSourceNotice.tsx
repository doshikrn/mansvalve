import { getPublicCatalogRuntimeInfo } from "@/lib/public-catalog";

export function PublicCatalogSourceNotice() {
  const info = getPublicCatalogRuntimeInfo();

  if (info.adminChangesVisibleOnPublicSite) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
        Публичный каталог читает данные из БД. Изменения товаров, изображений,
        категорий и документов после сохранения будут попадать на сайт.
      </div>
    );
  }

  const reason =
    info.configuredSource === "db" && !info.databaseConfigured
      ? "PUBLIC_CATALOG_SOURCE=db задан, но DATABASE_URL не настроен, поэтому публичный сайт перешел на JSON fallback."
      : "Публичный каталог сейчас использует JSON-источник.";

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      <strong className="font-semibold">Внимание:</strong> {reason} Изменения
      товаров в БД могут не отображаться на сайте до переключения
      <code className="mx-1 rounded bg-white/70 px-1 py-0.5">PUBLIC_CATALOG_SOURCE=db</code>
      или экспорта данных в JSON.
    </div>
  );
}
