"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Check, Copy, ExternalLink, FileText } from "lucide-react";

import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { warnInvalidMediaUrl } from "@/lib/media-url";

/** Remote / protocol-relative URLs use the image loader without host allowlist. */
function mediaImageNeedsUnoptimized(url: string): boolean {
  return (
    url.startsWith("/uploads/") ||
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("//")
  );
}

export type MediaLibraryItem = {
  id: string;
  url: string;
  storageKey?: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  alt: string | null;
  driver: string;
  createdAt: string;
  usedInProducts?: number;
  usedInCertificates?: number;
};

export type SelectedMediaItem = {
  mediaId: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  sortOrder: number;
  mimeType?: string;
  sizeBytes?: number;
};

type UploadJob = {
  id: string;
  name: string;
  progress: number;
  status: "uploading" | "done" | "error";
  error?: string;
};

type Props = {
  initialLibrary: MediaLibraryItem[];
  initialSelected?: SelectedMediaItem[];
  onSelectedChange?: (items: SelectedMediaItem[]) => void;
  hiddenInputName?: string;
  uploadFolder?: string;
  allowAttach?: boolean;
  attachOnUpload?: boolean;
  allowDelete?: boolean;
  title?: string;
  accept?: "image" | "document" | "all";
  multiple?: boolean;
};

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_DOCUMENT_BYTES = 20 * 1024 * 1024;

export function MediaUpload({
  initialLibrary,
  initialSelected = [],
  onSelectedChange,
  hiddenInputName,
  uploadFolder = "general",
  allowAttach = false,
  attachOnUpload = false,
  allowDelete = false,
  title = "Изображения",
  accept = "image",
  multiple = true,
}: Props) {
  const [library, setLibrary] = useState<MediaLibraryItem[]>(initialLibrary);
  const [selected, setSelected] = useState<SelectedMediaItem[]>(
    normalizeSelection(initialSelected),
  );
  const [dragOver, setDragOver] = useState(false);
  const [jobs, setJobs] = useState<UploadJob[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const visibleLibrary = useMemo(
    () => library.filter((item) => matchesAcceptedKind(item.mimeType, accept)),
    [accept, library],
  );

  const payload = useMemo(
    () =>
      JSON.stringify(
        selected.map((item, index) => ({
          mediaId: item.mediaId,
          alt: item.alt,
          isPrimary: item.isPrimary,
          sortOrder: index,
        })),
      ),
    [selected],
  );

  useEffect(() => {
    for (const item of library) {
      warnInvalidMediaUrl(item.url, "MediaUpload.library");
    }
    for (const item of selected) {
      warnInvalidMediaUrl(item.url, "MediaUpload.selected");
    }
  }, [library, selected]);

  useEffect(() => {
    onSelectedChange?.(selected);
  }, [onSelectedChange, selected]);

  async function handleFiles(files: FileList | File[]) {
    setError(null);
    const all = Array.from(files);
    for (const file of all) {
      if (!matchesAcceptedKind(file.type, accept)) {
        setError(buildInvalidKindMessage(file.name, accept));
        continue;
      }
      const maxBytes = file.type.startsWith("image/")
        ? MAX_IMAGE_BYTES
        : MAX_DOCUMENT_BYTES;
      if (file.size > maxBytes) {
        const maxMb = maxBytes / (1024 * 1024);
        setError(`Файл ${file.name} больше ${maxMb} MB.`);
        continue;
      }

      const jobId = crypto.randomUUID();
      setJobs((prev) => [
        { id: jobId, name: file.name, progress: 0, status: "uploading" },
        ...prev,
      ]);

      try {
        const uploaded = await uploadSingleFile(file, uploadFolder, (progress) => {
          setJobs((prev) =>
            prev.map((job) =>
              job.id === jobId ? { ...job, progress } : job,
            ),
          );
        });

        const nextAsset: MediaLibraryItem = {
          id: uploaded.id,
          url: uploaded.url,
          storageKey: uploaded.storageKey,
          mimeType: uploaded.mimeType,
          sizeBytes: uploaded.sizeBytes,
          width: uploaded.width,
          height: uploaded.height,
          alt: uploaded.alt,
          driver: uploaded.driver,
          createdAt: uploaded.createdAt,
          usedInProducts: 0,
        };

        setLibrary((prev) => [nextAsset, ...prev.filter((x) => x.id !== nextAsset.id)]);
        if (attachOnUpload && allowAttach) {
          setSelected((prev) => addToSelection(prev, nextAsset, multiple));
        }

        setJobs((prev) =>
          prev.map((job) =>
            job.id === jobId ? { ...job, progress: 100, status: "done" } : job,
          ),
        );
      } catch (uploadError) {
        const message =
          uploadError instanceof Error
            ? uploadError.message
            : "Ошибка загрузки";
        setJobs((prev) =>
          prev.map((job) =>
            job.id === jobId
              ? { ...job, status: "error", error: message }
              : job,
          ),
        );
        setError(message);
      }
    }
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) {
      void handleFiles(e.dataTransfer.files);
    }
  }

  function removeFromSelection(mediaId: string) {
    setSelected((prev) => {
      const filtered = prev.filter((x) => x.mediaId !== mediaId);
      return ensurePrimary(filtered);
    });
  }

  function setPrimary(mediaId: string) {
    setSelected((prev) =>
      prev.map((item) => ({
        ...item,
        isPrimary: item.mediaId === mediaId,
      })),
    );
  }

  function moveSelected(index: number, direction: -1 | 1) {
    setSelected((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return normalizeSelection(next);
    });
  }

  function updateSelectedAlt(mediaId: string, alt: string) {
    setSelected((prev) =>
      prev.map((item) =>
        item.mediaId === mediaId ? { ...item, alt: alt.slice(0, 300) } : item,
      ),
    );
  }

  async function handleDeleteAsset(id: string) {
    setError(null);
    setDeletingIds((prev) => new Set(prev).add(id));

    try {
      const response = await fetch(`/api/admin/media/${id}`, {
        method: "DELETE",
      });
      const body = (await response.json().catch(() => null)) as
        | {
            ok?: boolean;
            error?: string;
            code?:
              | "MEDIA_IN_USE_PRODUCT"
              | "MEDIA_IN_USE_CERTIFICATE"
              | "MEDIA_IN_USE_PRODUCT_DOCUMENT";
          }
        | null;

      if (!response.ok || body?.ok === false) {
        if (body?.code === "MEDIA_IN_USE_PRODUCT") {
          throw new Error("Файл используется в товаре.");
        }
        if (body?.code === "MEDIA_IN_USE_CERTIFICATE") {
          throw new Error("Файл используется в сертификате.");
        }
        if (body?.code === "MEDIA_IN_USE_PRODUCT_DOCUMENT") {
          throw new Error("Файл используется в документе товара.");
        }
        throw new Error(body?.error || "Не удалось удалить изображение.");
      }

      setLibrary((prev) => prev.filter((item) => item.id !== id));
      setSelected((prev) => ensurePrimary(prev.filter((x) => x.mediaId !== id)));
    } catch (deleteError) {
      const message =
        deleteError instanceof Error
          ? deleteError.message
          : "Ошибка удаления";
      setError(message);
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  async function copyAssetUrl(item: MediaLibraryItem) {
    setError(null);
    const value = getAbsoluteAssetUrl(item.url);
    try {
      await navigator.clipboard.writeText(value);
      setCopiedId(item.id);
      window.setTimeout(() => {
        setCopiedId((current) => (current === item.id ? null : current));
      }, 1500);
    } catch {
      setError("Не удалось скопировать ссылку. Откройте файл и скопируйте адрес из браузера.");
    }
  }

  return (
    <section className="space-y-4 rounded-xl border border-border bg-background p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
          {allowAttach ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Первое/основное изображение идёт на карточку товара. Если файлов нет, на сайте
              подставится картинка из раздела каталога.
            </p>
          ) : null}
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
        >
          Загрузить
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={getNativeAccept(accept)}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) {
            void handleFiles(e.target.files);
          }
          e.currentTarget.value = "";
        }}
      />

      <div
        className={[
          "rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground transition",
          dragOver ? "border-foreground/60 bg-muted/50" : "border-border",
        ].join(" ")}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        {getDropzoneText(accept)}
      </div>

      {hiddenInputName ? (
        <input type="hidden" name={hiddenInputName} value={payload} />
      ) : null}

      {jobs.length ? (
        <div className="space-y-2">
          {jobs.map((job) => (
            <div key={job.id} className="rounded-md border border-border p-2">
              <div className="flex items-center justify-between text-xs">
                <span className="truncate">{job.name}</span>
                <span>
                  {job.status === "error"
                    ? "Ошибка"
                    : job.status === "done"
                      ? "Готово"
                      : `${job.progress}%`}
                </span>
              </div>
              <div className="mt-1 h-1.5 rounded bg-muted">
                <div
                  className={[
                    "h-1.5 rounded transition-all",
                    job.status === "error" ? "bg-destructive" : "bg-primary",
                  ].join(" ")}
                  style={{ width: `${Math.max(2, job.progress)}%` }}
                />
              </div>
              {job.error ? (
                <p className="mt-1 text-xs text-destructive">{job.error}</p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {allowAttach ? (
        <div className="space-y-3">
          <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Прикрепленные файлы
          </h4>
          {selected.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Нет прикрепленных файлов. <AdminStatusBadge tone="auto" className="ml-1 align-middle">FALLBACK</AdminStatusBadge>
            </p>
          ) : (
            <div className="space-y-2">
              {selected.map((item, index) => (
                <div
                  key={item.mediaId}
                  className={[
                    "flex items-start gap-3 rounded-lg border p-2 transition",
                    item.isPrimary
                      ? "border-blue-500 bg-blue-50/70 ring-1 ring-blue-200"
                      : "border-border bg-background",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "relative shrink-0 rounded-md",
                      item.isPrimary ? "ring-2 ring-blue-600 ring-offset-2" : "",
                    ].join(" ")}
                  >
                    <MediaThumb item={item} className="h-16 w-16" />
                    {item.isPrimary ? (
                      <span className="absolute -left-1 -top-1 rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white shadow-sm">
                        primary
                      </span>
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <AdminStatusBadge tone={item.isPrimary ? "manual" : "readonly"}>
                        {item.isPrimary ? "PRIMARY IMAGE" : `ORDER ${index + 1}`}
                      </AdminStatusBadge>
                      {index === 0 && !item.isPrimary ? (
                        <AdminStatusBadge tone="auto">FIRST FALLBACK</AdminStatusBadge>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        size="xs"
                        variant={item.isPrimary ? "default" : "outline"}
                        aria-pressed={item.isPrimary}
                        onClick={() => setPrimary(item.mediaId)}
                      >
                        {item.isPrimary ? "Основное" : "Сделать основным"}
                      </Button>
                      <Button
                        type="button"
                        size="xs"
                        variant="outline"
                        aria-label="Поднять изображение выше"
                        onClick={() => moveSelected(index, -1)}
                        disabled={index === 0}
                      >
                        ↑
                      </Button>
                      <Button
                        type="button"
                        size="xs"
                        variant="outline"
                        aria-label="Опустить изображение ниже"
                        onClick={() => moveSelected(index, 1)}
                        disabled={index === selected.length - 1}
                      >
                        ↓
                      </Button>
                      <Button
                        type="button"
                        size="xs"
                        variant="destructive"
                        onClick={() => removeFromSelection(item.mediaId)}
                      >
                        Убрать
                      </Button>
                    </div>
                    <Input
                      value={item.alt}
                      onChange={(e) => updateSelectedAlt(item.mediaId, e.target.value)}
                      placeholder="Alt-текст / описание файла"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      <div className="space-y-2">
        <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Медиа библиотека
        </h4>
        {visibleLibrary.length === 0 ? (
          <p className="text-sm text-muted-foreground">Библиотека пуста.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-4">
            {visibleLibrary.map((item) => {
              const isSelected = selected.some((x) => x.mediaId === item.id);
              const deleting = deletingIds.has(item.id);
              return (
                <div
                  key={item.id}
                  className={[
                    "space-y-2 rounded-lg border p-2 transition",
                    isSelected
                      ? "border-blue-400 bg-blue-50/50"
                      : "border-border bg-background",
                  ].join(" ")}
                >
                  <MediaThumb item={item} className="h-24 w-full" />
                  <div className="space-y-1 text-[11px] text-muted-foreground">
                    <p className="line-clamp-2 break-words font-medium text-foreground">
                      {getMediaDisplayName(item)}
                    </p>
                    <p>{formatMediaMeta(item)}</p>
                    <p className="text-[10px] leading-tight">
                      {(() => {
                        const p = item.usedInProducts ?? 0;
                        const c = item.usedInCertificates ?? 0;
                        if (p === 0 && c === 0) {
                          return (
                            <span className="text-slate-500">Не используется в товарах и сертификатах</span>
                          );
                        }
                        return (
                          <span className="text-slate-700">
                            Товары: {p}
                            {c > 0 ? ` · Сертификаты: ${c}` : ""}
                          </span>
                        );
                      })()}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Button
                      type="button"
                      size="xs"
                      variant="outline"
                      asChild
                    >
                      <a href={item.url} target="_blank" rel="noreferrer">
                        <ExternalLink className="mr-1 h-3 w-3" />
                        Открыть
                      </a>
                    </Button>
                    <Button
                      type="button"
                      size="xs"
                      variant="outline"
                      onClick={() => void copyAssetUrl(item)}
                    >
                      {copiedId === item.id ? (
                        <Check className="mr-1 h-3 w-3" />
                      ) : (
                        <Copy className="mr-1 h-3 w-3" />
                      )}
                      {copiedId === item.id ? "Скопировано" : "URL"}
                    </Button>
                    {allowAttach ? (
                      <Button
                        type="button"
                        size="xs"
                        variant={isSelected ? "secondary" : "outline"}
                        disabled={isSelected}
                        onClick={() =>
                          setSelected((prev) => addToSelection(prev, item, multiple))
                        }
                      >
                        {isSelected ? "Добавлено" : "Добавить"}
                      </Button>
                    ) : null}
                    {allowDelete ? (
                      <Button
                        type="button"
                        size="xs"
                        variant="destructive"
                        disabled={deleting}
                        onClick={() => void handleDeleteAsset(item.id)}
                      >
                        {deleting ? "Удаление…" : "Удалить"}
                      </Button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </section>
  );
}

function addToSelection(
  current: SelectedMediaItem[],
  asset: MediaLibraryItem,
  multiple: boolean,
): SelectedMediaItem[] {
  if (current.some((item) => item.mediaId === asset.id)) {
    return current;
  }
  const next = [
    ...(multiple ? current : []),
    {
      mediaId: asset.id,
      url: asset.url,
      alt: asset.alt ?? "",
      isPrimary: !multiple || current.length === 0,
      sortOrder: multiple ? current.length : 0,
      mimeType: asset.mimeType,
      sizeBytes: asset.sizeBytes,
    },
  ];
  return normalizeSelection(next);
}

function normalizeSelection(items: SelectedMediaItem[]): SelectedMediaItem[] {
  const base = items.map((item, index) => ({ ...item, sortOrder: index }));
  return ensurePrimary(base);
}

function ensurePrimary(items: SelectedMediaItem[]): SelectedMediaItem[] {
  if (!items.length) return items;
  const primaryIndex = items.findIndex((item) => item.isPrimary);
  const resolved = primaryIndex >= 0 ? primaryIndex : 0;
  return items.map((item, index) => ({
    ...item,
    isPrimary: index === resolved,
    sortOrder: index,
  }));
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatMediaMeta(item: MediaLibraryItem): string {
  const parts = [getFileLabel(item.mimeType), formatBytes(item.sizeBytes)];
  if (item.mimeType.startsWith("image/") && item.width && item.height) {
    parts.unshift(`${item.width}x${item.height}`);
  }
  return parts.join(" · ");
}

function getMediaDisplayName(item: MediaLibraryItem): string {
  if (item.alt?.trim()) return item.alt.trim();
  const source = item.storageKey || item.url;
  const lastSegment = source.split("/").filter(Boolean).at(-1);
  return decodeURIComponent(lastSegment || "Файл");
}

function getAbsoluteAssetUrl(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("//")) return `${window.location.protocol}${url}`;
  return new URL(url, window.location.origin).toString();
}

function matchesAcceptedKind(mimeType: string, accept: "image" | "document" | "all") {
  if (accept === "all") return true;
  if (accept === "image") return mimeType.startsWith("image/");
  return isSupportedDocumentMime(mimeType);
}

function isSupportedDocumentMime(mimeType: string) {
  return [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ].includes(mimeType);
}

function getNativeAccept(accept: "image" | "document" | "all") {
  if (accept === "image") return "image/*";
  const documents = ".pdf,.doc,.docx,.xls,.xlsx,application/pdf";
  if (accept === "document") return documents;
  return `image/*,${documents}`;
}

function getDropzoneText(accept: "image" | "document" | "all") {
  if (accept === "image") return "Перетащите изображения сюда или нажмите «Загрузить»";
  if (accept === "document") return "Перетащите PDF/DOC/XLS сюда или нажмите «Загрузить»";
  return "Перетащите файлы сюда или нажмите «Загрузить»";
}

function buildInvalidKindMessage(filename: string, accept: "image" | "document" | "all") {
  if (accept === "image") return `Файл ${filename} не является изображением.`;
  if (accept === "document") return `Файл ${filename} не является PDF/DOC/XLS документом.`;
  return `Файл ${filename} имеет неподдерживаемый тип.`;
}

function MediaThumb({
  item,
  className,
}: {
  item: {
    url: string;
    alt: string | null;
    mimeType?: string;
    sizeBytes?: number;
  };
  className: string;
}) {
  const mimeType = item.mimeType ?? "image/*";
  if (mimeType.startsWith("image/")) {
    return (
      <div className={`relative overflow-hidden rounded ${className}`}>
        <Image
          src={item.url}
          alt={item.alt || "Media"}
          fill
          sizes="(max-width: 768px) 50vw, 200px"
          unoptimized={mediaImageNeedsUnoptimized(item.url)}
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div className={`flex shrink-0 flex-col items-center justify-center rounded bg-muted text-muted-foreground ${className}`}>
      <FileText className="h-6 w-6" />
      <span className="mt-1 max-w-full truncate px-1 text-[10px] font-medium uppercase">
        {getFileLabel(mimeType)}
      </span>
    </div>
  );
}

function getFileLabel(mimeType: string) {
  if (mimeType === "application/pdf") return "PDF";
  if (mimeType.includes("word")) return "DOC";
  if (mimeType.includes("excel") || mimeType.includes("spreadsheet")) return "XLS";
  return "FILE";
}

function uploadSingleFile(
  file: File,
  folder: string,
  onProgress: (progress: number) => void,
): Promise<UploadedAsset> {
  type UploadBody = {
    ok?: boolean;
    error?: string;
    asset?: UploadedAsset;
  };

  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/media");

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onerror = () => reject(new Error("Сетевая ошибка при загрузке."));
    xhr.onload = () => {
      let body: UploadBody;
      try {
        body = JSON.parse(xhr.responseText) as UploadBody;
      } catch {
        reject(new Error(buildUnexpectedUploadResponseMessage(xhr)));
        return;
      }

      if (xhr.status < 200 || xhr.status >= 300 || body.ok !== true) {
        reject(new Error(body.error || "Не удалось загрузить файл."));
        return;
      }

      if (!body.asset?.id || !body.asset?.url) {
        reject(new Error("Сервер вернул неполные данные по файлу."));
        return;
      }

      resolve(body.asset);
    };

    xhr.send(formData);
  });
}

function buildUnexpectedUploadResponseMessage(xhr: XMLHttpRequest): string {
  if (xhr.status === 413) {
    return "Файл слишком большой для сервера. Нужно увеличить лимит загрузки или сжать файл.";
  }
  if (xhr.status === 401 || xhr.responseURL.includes("/admin/login")) {
    return "Сессия администратора истекла. Войдите в админку заново и повторите загрузку.";
  }
  if (xhr.status >= 500) {
    return "Серверная ошибка при загрузке. Проверьте логи PM2.";
  }
  const plainText = xhr.responseText.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const details = plainText ? ` ${plainText.slice(0, 160)}` : "";
  return `Сервер вернул неожиданный ответ${xhr.status ? ` (${xhr.status})` : ""}.${details}`;
}

type UploadedAsset = {
  id: string;
  url: string;
  storageKey?: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  alt: string | null;
  driver: string;
  createdAt: string;
};
