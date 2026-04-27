"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** Remote / protocol-relative URLs use the image loader without host allowlist. */
function mediaImageNeedsUnoptimized(url: string): boolean {
  return (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("//")
  );
}

export type MediaLibraryItem = {
  id: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  alt: string | null;
  driver: string;
  createdAt: string;
  usedInProducts?: number;
};

export type SelectedMediaItem = {
  mediaId: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  sortOrder: number;
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
  hiddenInputName?: string;
  uploadFolder?: string;
  allowAttach?: boolean;
  attachOnUpload?: boolean;
  allowDelete?: boolean;
  title?: string;
};

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export function MediaUpload({
  initialLibrary,
  initialSelected = [],
  hiddenInputName,
  uploadFolder = "general",
  allowAttach = false,
  attachOnUpload = false,
  allowDelete = false,
  title = "Изображения",
}: Props) {
  const [library, setLibrary] = useState<MediaLibraryItem[]>(initialLibrary);
  const [selected, setSelected] = useState<SelectedMediaItem[]>(
    normalizeSelection(initialSelected),
  );
  const [dragOver, setDragOver] = useState(false);
  const [jobs, setJobs] = useState<UploadJob[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  async function handleFiles(files: FileList | File[]) {
    setError(null);
    const all = Array.from(files);
    for (const file of all) {
      if (!file.type.startsWith("image/")) {
        setError(`Файл ${file.name} не является изображением.`);
        continue;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        setError(`Файл ${file.name} больше 10 MB.`);
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
          setSelected((prev) => addToSelection(prev, nextAsset));
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
            code?: "MEDIA_IN_USE_PRODUCT" | "MEDIA_IN_USE_CERTIFICATE";
          }
        | null;

      if (!response.ok || body?.ok === false) {
        if (body?.code === "MEDIA_IN_USE_PRODUCT") {
          throw new Error("Файл используется в товаре.");
        }
        if (body?.code === "MEDIA_IN_USE_CERTIFICATE") {
          throw new Error("Файл используется в сертификате.");
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

  return (
    <section className="space-y-4 rounded-xl border border-border bg-background p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
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
        accept="image/*"
        multiple
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
        Перетащите изображения сюда или нажмите «Загрузить»
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
            Прикрепленные к товару
          </h4>
          {selected.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Нет прикрепленных изображений.
            </p>
          ) : (
            <div className="space-y-2">
              {selected.map((item, index) => (
                <div
                  key={item.mediaId}
                  className="flex items-start gap-3 rounded-lg border border-border p-2"
                >
                  <Image
                    src={item.url}
                    alt={item.alt || "Preview"}
                    width={64}
                    height={64}
                    unoptimized={mediaImageNeedsUnoptimized(item.url)}
                    className="h-16 w-16 rounded object-cover"
                  />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        size="xs"
                        variant={item.isPrimary ? "default" : "outline"}
                        onClick={() => setPrimary(item.mediaId)}
                      >
                        {item.isPrimary ? "Основное" : "Сделать основным"}
                      </Button>
                      <Button
                        type="button"
                        size="xs"
                        variant="outline"
                        onClick={() => moveSelected(index, -1)}
                        disabled={index === 0}
                      >
                        ↑
                      </Button>
                      <Button
                        type="button"
                        size="xs"
                        variant="outline"
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
                      placeholder="Alt-текст изображения"
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
        {library.length === 0 ? (
          <p className="text-sm text-muted-foreground">Библиотека пуста.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-4">
            {library.map((item) => {
              const isSelected = selected.some((x) => x.mediaId === item.id);
              const deleting = deletingIds.has(item.id);
              return (
                <div
                  key={item.id}
                  className="space-y-2 rounded-lg border border-border p-2"
                >
                  <div className="relative h-24 w-full overflow-hidden rounded">
                    <Image
                      src={item.url}
                      alt={item.alt || "Media"}
                      fill
                      sizes="(max-width: 768px) 50vw, 200px"
                      unoptimized={mediaImageNeedsUnoptimized(item.url)}
                      className="object-cover"
                    />
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {item.width ?? "?"}×{item.height ?? "?"} ·{" "}
                    {formatBytes(item.sizeBytes)}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {allowAttach ? (
                      <Button
                        type="button"
                        size="xs"
                        variant={isSelected ? "secondary" : "outline"}
                        disabled={isSelected}
                        onClick={() =>
                          setSelected((prev) => addToSelection(prev, item))
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
                        {deleting ? "..." : "Удалить"}
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
): SelectedMediaItem[] {
  if (current.some((item) => item.mediaId === asset.id)) {
    return current;
  }
  const next = [
    ...current,
    {
      mediaId: asset.id,
      url: asset.url,
      alt: asset.alt ?? "",
      isPrimary: current.length === 0,
      sortOrder: current.length,
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
        reject(new Error("Некорректный ответ сервера."));
        return;
      }

      if (xhr.status < 200 || xhr.status >= 300 || body.ok !== true) {
        reject(new Error(body.error || "Не удалось загрузить изображение."));
        return;
      }

      if (!body.asset?.id || !body.asset?.url) {
        reject(new Error("Сервер вернул неполные данные по изображению."));
        return;
      }

      resolve(body.asset);
    };

    xhr.send(formData);
  });
}

type UploadedAsset = {
  id: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  alt: string | null;
  driver: string;
  createdAt: string;
};
