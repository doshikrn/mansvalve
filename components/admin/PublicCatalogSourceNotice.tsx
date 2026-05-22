import { getPublicCatalogRuntimeInfo } from "@/lib/public-catalog";

export function PublicCatalogSourceNotice() {
  const info = getPublicCatalogRuntimeInfo();

  if (info.adminChangesVisibleOnPublicSite) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
        Сайт сейчас показывает каталог из <strong>вашей базы данных</strong>. После
        сохранения товара или раздела изменения уходят на публичные страницы.
      </div>
    );
  }

  const technicalReason =
    info.configuredSource === "db" && !info.databaseConfigured
      ? "В настройках выбрана база данных, но подключение не настроено — сайт временно берёт сохранённый файл каталога."
      : "Сайт сейчас читает каталог из сохранённого файла, а не из базы, с которой работает эта админка.";

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      <p>
        <strong className="font-semibold">Внимание:</strong> {technicalReason}{" "}
        Правки здесь могут не совпадать с тем, что видит клиент, пока не переключат
        источник данных на сервере.
      </p>
      <details className="mt-2 text-xs text-amber-900/80">
        <summary className="cursor-pointer select-none hover:underline">
          Подробности для разработчика
        </summary>
        <p className="mt-1.5 rounded-md bg-white/50 p-2 font-mono text-[11px] leading-relaxed">
          configuredSource={info.configuredSource}; effectiveSource={info.effectiveSource};
          databaseConfigured={String(info.databaseConfigured)}.
        </p>
      </details>
    </div>
  );
}
