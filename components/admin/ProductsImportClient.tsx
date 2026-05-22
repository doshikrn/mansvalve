"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { useActionState, useMemo } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import type {
  ImportApplyState,
  ImportPreviewState,
} from "@/app/admin/products/import/actions";

type PreviewAction = (
  state: ImportPreviewState,
  formData: FormData,
) => Promise<ImportPreviewState>;
type ApplyAction = (
  state: ImportApplyState,
  formData: FormData,
) => Promise<ImportApplyState>;

const INITIAL_PREVIEW: ImportPreviewState = {};
const INITIAL_APPLY: ImportApplyState = {};

export function ProductsImportClient({
  previewAction,
  applyAction,
}: {
  previewAction: PreviewAction;
  applyAction: ApplyAction;
}) {
  const [previewState, runPreview] = useActionState(previewAction, INITIAL_PREVIEW);
  const [applyState, runApply] = useActionState(applyAction, INITIAL_APPLY);

  const preview = previewState.preview;
  const summary = preview?.summary;
  const canApply = useMemo(() => {
    if (!preview) return false;
    return preview.rows.some(
      (row) => row.action === "create" || row.action === "update",
    );
  }, [preview]);

  const applyResult = applyState.result;

  return (
    <div className="space-y-4">
      {!applyResult ? (
        <form
          action={runPreview}
          encType="multipart/form-data"
          className="space-y-4"
        >
          <div className="space-y-3 rounded-xl border border-border bg-background p-4">
            <div>
              <label className="text-sm font-semibold" htmlFor="file">
                Файл .xlsx
              </label>
              <input
                type="file"
                id="file"
                name="file"
                accept=".xlsx"
                required
                className="mt-2 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            {previewState.error ? (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {previewState.error}
              </p>
            ) : null}
            <PreviewSubmit />
          </div>

          {preview ? (
            <section className="overflow-hidden rounded-xl border border-border bg-background">
              <div className="sticky top-0 z-20 flex flex-col gap-3 border-b border-border bg-background/95 px-4 py-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/90 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-semibold">Превью импорта</h2>
                  <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span>
                      Всего: <strong className="text-foreground">{summary?.total ?? 0}</strong>
                    </span>
                    <span>
                      Создать:{" "}
                      <strong className="text-emerald-800">{summary?.create ?? 0}</strong>
                    </span>
                    <span>
                      Обновить:{" "}
                      <strong className="text-sky-800">{summary?.update ?? 0}</strong>
                    </span>
                    <span>
                      Ошибок:{" "}
                      <strong className="text-destructive">{summary?.error ?? 0}</strong>
                    </span>
                    {summary?.truncated ? (
                      <span className="text-amber-800">Файл обрезан до лимита строк.</span>
                    ) : null}
                  </p>
                </div>
                {canApply ? (
                  <div className="flex shrink-0 flex-col items-stretch gap-1 sm:flex-row sm:items-center">
                    <input
                      type="hidden"
                      name="payloads"
                      value={previewState.payloadsJson ?? "[]"}
                    />
                    <ApplySubmit summary={summary} formAction={runApply} />
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Нет валидных строк для применения.
                  </span>
                )}
              </div>

              <div className="space-y-3 p-4">
                {summary?.unknownHeaders.length ? (
                  <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                    Лишние колонки в файле проигнорированы: {summary.unknownHeaders.join(", ")}.
                  </p>
                ) : null}

                {applyState.error ? (
                  <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {applyState.error}
                  </p>
                ) : null}

                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="px-2 py-2 text-left">Стр.</th>
                        <th className="px-2 py-2 text-left">Действие</th>
                        <th className="px-3 py-2 text-left">Название</th>
                        <th className="px-3 py-2 text-left">Ключевые поля</th>
                        <th className="px-3 py-2 text-left">Итог</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.rows.map((row) => (
                        <tr key={row.rowNumber} className="border-t border-border align-top">
                          <td className="px-2 py-2 text-xs text-muted-foreground">
                            {row.rowNumber}
                          </td>
                          <td className="px-2 py-2">
                            <ActionBadge action={row.action} />
                          </td>
                          <td className="max-w-[14rem] px-3 py-2 font-medium">
                            <span className="line-clamp-2">{row.display.name || "—"}</span>
                          </td>
                          <td className="max-w-[18rem] px-3 py-2 text-xs text-muted-foreground">
                            <div className="line-clamp-1 font-mono">{row.display.slug || "—"}</div>
                            <div className="line-clamp-2">
                              {row.display.categoryName}
                              {row.display.subcategoryName ? ` · ${row.display.subcategoryName}` : ""}
                            </div>
                            <div className="line-clamp-1 text-[11px]">
                              SEO: {row.display.seoTitle || "—"} · Фото:{" "}
                              {row.display.imageStatus === "matched"
                                ? "ok"
                                : row.display.imageStatus === "missing"
                                  ? "нет"
                                  : "—"}
                            </div>
                          </td>
                          <td className="max-w-[16rem] px-3 py-2 text-xs">
                            <div className="text-muted-foreground">{row.display.publication}</div>
                            {row.errors.length || row.warnings.length ? (
                              <ul className="mt-1 max-h-16 space-y-0.5 overflow-y-auto">
                                {row.errors.map((message, idx) => (
                                  <li key={`e-${idx}`} className="text-destructive">
                                    • {message}
                                  </li>
                                ))}
                                {row.warnings.map((message, idx) => (
                                  <li key={`w-${idx}`} className="text-amber-700">
                                    • {message}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span className="mt-1 inline-block text-emerald-700">ok</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          ) : null}
        </form>
      ) : null}

      {applyResult ? (
        <section className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">
          <h2 className="text-base font-semibold">Импорт завершён</h2>
          <ul className="space-y-1">
            <li>Создано: {applyResult.created}</li>
            <li>Обновлено: {applyResult.updated}</li>
            <li>С ошибками: {applyResult.failed}</li>
          </ul>
          {applyResult.errors.length ? (
            <details className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
              <summary className="cursor-pointer">
                Подробности ошибок ({applyResult.errors.length})
              </summary>
              <ul className="mt-2 space-y-1">
                {applyResult.errors.map((error, idx) => (
                  <li key={idx}>
                    Строка {error.rowNumber}: {error.message}
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/products">К списку товаров</Link>
            </Button>
            <Button asChild size="sm" variant="ghost">
              <Link href="/admin/products/import">Импортировать ещё</Link>
            </Button>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function PreviewSubmit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending} aria-busy={pending}>
      {pending ? "Выполняется…" : "Загрузить и построить превью"}
    </Button>
  );
}

function ApplySubmit({
  summary,
  formAction,
}: {
  summary?: { create: number; update: number };
  formAction: NonNullable<ComponentProps<"button">["formAction"]>;
}) {
  const { pending } = useFormStatus();
  const label = summary
    ? `Применить (${summary.create} создать, ${summary.update} обновить)`
    : "Применить импорт";
  return (
    <Button
      type="submit"
      size="sm"
      disabled={pending}
      formAction={formAction}
      formNoValidate
      aria-busy={pending}
    >
      {pending ? "Выполняется…" : label}
    </Button>
  );
}

function ActionBadge({
  action,
}: {
  action: "create" | "update" | "skip" | "error";
}) {
  const styles =
    action === "create"
      ? "bg-emerald-100 text-emerald-900"
      : action === "update"
        ? "bg-sky-100 text-sky-900"
        : action === "skip"
          ? "bg-slate-100 text-slate-900"
          : "bg-red-100 text-red-900";
  const label =
    action === "create"
      ? "create"
      : action === "update"
        ? "update"
        : action === "skip"
          ? "skip"
          : "error";
  return (
    <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${styles}`}>
      {label}
    </span>
  );
}
